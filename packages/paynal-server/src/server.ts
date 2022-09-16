import EventEmitter from "events"
import { Server as WSServer, WebSocket as ws } from 'ws'
import cuid from "cuid"
import { Frame, Headers, Break, SERVER_FRAMES } from '@paynal/core'

import {
    WebSocket,
    Config,
    SecureConfig,
    Middleware,
    Command,
    Subscriber
} from "../@types"
import { WebSocketsHandler } from './web-sockets-handler'
import {
    tokenizeDestination,
    checkSubMatchDestination
} from './destination'
import { buildConfig } from "./build-config"

export class Server extends EventEmitter {
    readonly webSocketsHandler: WebSocketsHandler
    readonly server: WSServer
    private subscribers: Subscriber[] = []
    readonly middlewares: { [x: string]: Middleware[] } = {}
    readonly config: SecureConfig
    private readonly selfSocket: any

    constructor(config: Config) {
        super()
        this.selfSocket = { sessionId: `colibri__${cuid()}` }
        this.config = buildConfig(config)
        this.server = new WSServer({
            server: this.config.server,
            path: this.config.path,
            perMessageDeflate: false,
        })
        this.server.on('connection', (ws: ws) => {
            const socket = WebSocket.fromWebSocket(ws)
            socket.sessionId = cuid()
            this.emit('connecting', socket.sessionId)
            this.config.debug('Connect', socket.sessionId)
            socket.on(
                'message',
                (data: string | Buffer) =>
                    this.parseRequest(socket, data)
            )
            socket.on(
                'close',
                () => this.disconnectClient(socket)
            )
            socket.on('error', (err) => {
                this.config.debug(err)
                this.emit('error', err)
            })
        })
        this.webSocketsHandler = new WebSocketsHandler(this, this.config)
    }

    subscribe(
        topic: string,
        callback: (msg: string, headers: Headers) => void,
        headers?: Headers
    ): { id: string, unsubscribe: () => void } {
        const id = headers?.id?.toString() ?? cuid()
        const subscriber: Subscriber = {
            topic: topic,
            tokens: tokenizeDestination(topic),
            id: id,
            sessionId: this.selfSocket.sessionId,
            socket: this.selfSocket
        };
        this.subscribers.push(subscriber);
        this.emit('subscribe', subscriber);
        if (callback) this.on(id, callback)
        return { id, unsubscribe: () => this.unsubscribe(id) };
    }

    private unsubscribe(id: string) {
        this.removeAllListeners(id);
        return this.unsubscribeClient(this.selfSocket, { id });
    };

    onClientConnected(
        socket: WebSocket,
        args: { heartbeat: number[], headers: Headers }
    ) {
        const middleware = this.withMiddleware('connect',
            (socket, { heartbeat, headers }: { heartbeat: number[], headers: Headers }) => {
                socket.clientHeartbeat = {
                    client: heartbeat[0],
                    server: heartbeat[1]
                }
                this.config.debug('CONNECT', socket.sessionId, socket.clientHeartbeat, headers)
                this.emit('connected', socket.sessionId, headers)
            })
        middleware(socket, args)
    }

    private parseRequest(socket: WebSocket, data: string | Buffer): void {
        // check if it's incoming heartbeat
        if (socket.heartbeatClock) {
            // beat
            socket.heartbeatTime = Date.now()
            // if it's ping then ignore
            if (data === Break) {
                this.config.debug('PONG')
                return
            }
        }
        const frame = Frame.fromPayload(data)
        switch (frame.command) {
            case 'CONNECT':
                this.webSocketsHandler.CONNECT(socket, frame)
                break;
            case 'DISCONNECT':
                this.webSocketsHandler.DISCONNECT(socket, frame)
                break;
            case 'SUBSCRIBE':
                this.webSocketsHandler.SUBSCRIBE(socket, frame)
                break;
            case 'UNSUBSCRIBE':
                this.webSocketsHandler.UNSUBSCRIBE(socket, frame)
                break;
            case 'SEND':
                this.webSocketsHandler.SEND(socket, frame)
                break;
            default:
                const errorFrame = SERVER_FRAMES.ERROR(
                    'Command not found',
                    `Command not found: \n-----\n${frame.command}\n-----`
                )
                socket.sendFrame(errorFrame)
                break;
        }
    }

    sendMessage(topic: string, headers: Headers = {}, body?: any): void {
        const middleware = this.withMiddleware('send', (_socket, _args) => {
            this.subscribers.forEach(subscriber => {
                if (this.selfSocket.sessionId === subscriber.sessionId) return
                if (!checkSubMatchDestination(subscriber, topic)) return
                if (!subscriber.socket) return
                const frame = SERVER_FRAMES.MESSAGE(subscriber.id, topic, headers, body)
                this.emit('send', { topic, frame })
                this.emit(subscriber.id, frame)
                subscriber.socket.sendFrame(frame)
            })
        })
        middleware(this.selfSocket, {})
    }

    sendClient(
        socket: WebSocket,
        topic: string,
        frame: Frame,
        callback?: (res: boolean) => void
    ) {
        const middleware = this.withMiddleware('send', (_socket, _args, callback) => {
            this.subscribers.forEach(subscriber => {
                if (socket.sessionId === subscriber.sessionId) return
                if (!checkSubMatchDestination(subscriber, topic)) return
                if (!subscriber.socket) return
                const messageFrame = SERVER_FRAMES.MESSAGE(subscriber.id, topic, frame.body, frame.headers)
                this.emit('send', { topic, frame: messageFrame })
                this.emit(subscriber.id, messageFrame)
                if (this.selfSocket.sessionId != subscriber.socket.sessionId)
                    subscriber.socket.sendFrame(messageFrame)
            })
            if (callback) callback(true)
        })
        middleware(socket, {}, callback)
    }

    addMiddleware(command: Command, handler: Middleware): void {
        if (!this.middlewares[command]) this.middlewares[command] = []
        this.middlewares[command].push(handler)
    }

    private withMiddleware(command: Command, handler: Middleware): Middleware {
        return (socket, args, callback) => {
            const handlers = this.middlewares[command] || []
            handlers.forEach(middleware => middleware(socket, args))
            handler(socket, args, callback)
        }
    }

    subscribeClient(
        socket: WebSocket,
        args: { dest: string, id: string }
    ) {
        const middleware = this.withMiddleware('subscribe',
            (socket, { destination, id }: { destination: string, id: string }) => {
                const sub: Subscriber = {
                    id: id,
                    sessionId: socket.sessionId,
                    topic: destination,
                    tokens: tokenizeDestination(destination),
                    socket: socket
                }
                this.subscribers.push(sub)
                this.emit('subscribe', sub)
                this.config.debug('Server subscribe', id, destination)
            })
        middleware(socket, args)
    }

    unsubscribeClient(socket: WebSocket, args: { id: string }) {
        const middleware = this.withMiddleware('unsubscribe', (socket, { id }: { id: string }) => {
            this.subscribers = this.subscribers.filter(subscriber => {
                const unsubscribe = subscriber.id == id && subscriber.sessionId == socket.sessionId
                if (unsubscribe) this.emit('unsubscribe', subscriber)
                return !unsubscribe
            })
        })
        middleware(socket, args)
    }

    disconnectClient(socket: WebSocket, args?: any) {
        const withMiddleware = this.withMiddleware('disconnect', (socket) => {
            this.afterConnectionClose(socket)
            this.config.debug('DISCONNECT', socket.sessionId)
            this.emit('disconnected', socket.sessionId)
        })
        withMiddleware(socket, args)
    }

    heartbeatOn(socket: WebSocket, intervalTime: number, serverSide: boolean) {
        if (serverSide) {
            // Server takes responsibility for sending pings
            // Client should close connection on timeout
            socket.heartbeatClock = setInterval(() => {
                if (socket.readyState === 1) {
                    this.config.debug('PING')
                    socket.send(Break)
                }
            }, intervalTime)
            return
        }
        // Client takes responsibility for sending pings
        // Server should close connection on timeout
        socket.heartbeatTime = Date.now() + intervalTime
        socket.heartbeatClock = setInterval(() => {
            const diff = Date.now() - socket.heartbeatTime
            if (diff > intervalTime + this.config.heartbeatErrorMargin) {
                this.config.debug('HEALTH CHECK failed! Closing', diff, intervalTime)
                socket.close()
            } else {
                this.config.debug('HEALTH CHECK ok!', diff, intervalTime)
                socket.heartbeatTime -= diff
            }
        }, intervalTime)
    }

    heartbeatOff(socket: WebSocket) {
        if (socket.heartbeatClock) {
            clearInterval(socket.heartbeatClock)
            socket.heartbeatClock = undefined
        }
    }

    afterConnectionClose(socket: WebSocket) {
        // remove from subscribes
        this.subscribers = this.subscribers
            .filter(subscriber =>
                subscriber.sessionId !== socket.sessionId)
        // turn off server side heart-beat (if needed)
        this.heartbeatOff(socket)
    }
}

export default Server
