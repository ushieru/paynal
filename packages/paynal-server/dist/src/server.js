"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const events_1 = __importDefault(require("events"));
const ws_1 = require("ws");
const cuid_1 = __importDefault(require("cuid"));
const core_1 = require("@paynal/core");
const _types_1 = require("../@types");
const web_sockets_handler_1 = require("./web-sockets-handler");
const destination_1 = require("./destination");
const build_config_1 = require("./build-config");
class Server extends events_1.default {
    constructor(config) {
        super();
        this.subscribers = [];
        this.middlewares = {};
        this.selfSocket = { sessionId: `colibri__${(0, cuid_1.default)()}` };
        this.config = (0, build_config_1.buildConfig)(config);
        this.server = new ws_1.Server({
            server: this.config.server,
            path: this.config.path,
            perMessageDeflate: false,
        });
        this.server.on('connection', (ws) => {
            const socket = _types_1.WebSocket.fromWebSocket(ws);
            socket.sessionId = (0, cuid_1.default)();
            this.emit('connecting', socket.sessionId);
            this.config.debug('Connect', socket.sessionId);
            socket.on('message', (data) => this.parseRequest(socket, data));
            socket.on('close', () => this.disconnectClient(socket));
            socket.on('error', (err) => {
                this.config.debug(err);
                this.emit('error', err);
            });
        });
        this.webSocketsHandler = new web_sockets_handler_1.WebSocketsHandler(this, this.config);
    }
    subscribe(topic, callback, headers) {
        var _a, _b;
        const id = (_b = (_a = headers === null || headers === void 0 ? void 0 : headers.id) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : (0, cuid_1.default)();
        const subscriber = {
            topic: topic,
            tokens: (0, destination_1.tokenizeDestination)(topic),
            id: id,
            sessionId: this.selfSocket.sessionId,
            socket: this.selfSocket
        };
        this.subscribers.push(subscriber);
        this.emit('subscribe', subscriber);
        if (callback)
            this.on(id, callback);
        return { id, unsubscribe: () => this.unsubscribe(id) };
    }
    unsubscribe(id) {
        this.removeAllListeners(id);
        return this.unsubscribeClient(this.selfSocket, { id });
    }
    ;
    onClientConnected(socket, args) {
        const middleware = this.withMiddleware('connect', (socket, { heartbeat, headers }) => {
            socket.clientHeartbeat = {
                client: heartbeat[0],
                server: heartbeat[1]
            };
            this.config.debug('CONNECT', socket.sessionId, socket.clientHeartbeat, headers);
            this.emit('connected', socket.sessionId, headers);
        });
        middleware(socket, args);
    }
    parseRequest(socket, data) {
        // check if it's incoming heartbeat
        if (socket.heartbeatClock) {
            // beat
            socket.heartbeatTime = Date.now();
            // if it's ping then ignore
            if (data === core_1.Break) {
                this.config.debug('PONG');
                return;
            }
        }
        const frame = core_1.Frame.fromPayload(data);
        switch (frame.command) {
            case 'CONNECT':
                this.webSocketsHandler.CONNECT(socket, frame);
                break;
            case 'DISCONNECT':
                this.webSocketsHandler.DISCONNECT(socket, frame);
                break;
            case 'SUBSCRIBE':
                this.webSocketsHandler.SUBSCRIBE(socket, frame);
                break;
            case 'UNSUBSCRIBE':
                this.webSocketsHandler.UNSUBSCRIBE(socket, frame);
                break;
            case 'SEND':
                this.webSocketsHandler.SEND(socket, frame);
                break;
            default:
                const errorFrame = core_1.SERVER_FRAMES.ERROR('Command not found', `Command not found: \n-----\n${frame.command}\n-----`);
                socket.sendFrame(errorFrame);
                break;
        }
    }
    sendMessage(topic, headers = {}, body) {
        const middleware = this.withMiddleware('send', (_socket, _args) => {
            this.subscribers.forEach(subscriber => {
                if (this.selfSocket.sessionId === subscriber.sessionId)
                    return;
                if (!(0, destination_1.checkSubMatchDestination)(subscriber, topic))
                    return;
                if (!subscriber.socket)
                    return;
                const frame = core_1.SERVER_FRAMES.MESSAGE(subscriber.id, topic, body, headers);
                this.emit('send', { topic, frame });
                this.emit(subscriber.id, frame);
                subscriber.socket.sendFrame(frame);
            });
        });
        middleware(this.selfSocket, {});
    }
    sendClient(socket, topic, frame, callback) {
        const middleware = this.withMiddleware('send', (_socket, _args, callback) => {
            this.subscribers.forEach(subscriber => {
                if (socket.sessionId === subscriber.sessionId)
                    return;
                if (!(0, destination_1.checkSubMatchDestination)(subscriber, topic))
                    return;
                if (!subscriber.socket)
                    return;
                const messageFrame = core_1.SERVER_FRAMES.MESSAGE(subscriber.id, topic, frame.body, frame.headers);
                this.emit('send', { topic, frame: messageFrame });
                this.emit(subscriber.id, messageFrame);
                if (this.selfSocket.sessionId != subscriber.socket.sessionId)
                    subscriber.socket.sendFrame(messageFrame);
            });
            if (callback)
                callback(true);
        });
        middleware(socket, {}, callback);
    }
    addMiddleware(command, handler) {
        if (!this.middlewares[command])
            this.middlewares[command] = [];
        this.middlewares[command].push(handler);
    }
    withMiddleware(command, handler) {
        return (socket, args, callback) => {
            const handlers = this.middlewares[command] || [];
            handlers.forEach(middleware => middleware(socket, args));
            handler(socket, args, callback);
        };
    }
    subscribeClient(socket, args) {
        const middleware = this.withMiddleware('subscribe', (socket, { destination, id }) => {
            const sub = {
                id: id,
                sessionId: socket.sessionId,
                topic: destination,
                tokens: (0, destination_1.tokenizeDestination)(destination),
                socket: socket
            };
            this.subscribers.push(sub);
            this.emit('subscribe', sub);
            this.config.debug('Server subscribe', id, destination);
        });
        middleware(socket, args);
    }
    unsubscribeClient(socket, args) {
        const middleware = this.withMiddleware('unsubscribe', (socket, { id }) => {
            this.subscribers = this.subscribers.filter(subscriber => {
                const unsubscribe = subscriber.id == id && subscriber.sessionId == socket.sessionId;
                if (unsubscribe)
                    this.emit('unsubscribe', subscriber);
                return !unsubscribe;
            });
        });
        middleware(socket, args);
    }
    disconnectClient(socket, args) {
        const withMiddleware = this.withMiddleware('disconnect', (socket) => {
            this.afterConnectionClose(socket);
            this.config.debug('DISCONNECT', socket.sessionId);
            this.emit('disconnected', socket.sessionId);
        });
        withMiddleware(socket, args);
    }
    heartbeatOn(socket, intervalTime, serverSide) {
        if (serverSide) {
            // Server takes responsibility for sending pings
            // Client should close connection on timeout
            socket.heartbeatClock = setInterval(() => {
                if (socket.readyState === 1) {
                    this.config.debug('PING');
                    socket.send(core_1.Break);
                }
            }, intervalTime);
            return;
        }
        // Client takes responsibility for sending pings
        // Server should close connection on timeout
        socket.heartbeatTime = Date.now() + intervalTime;
        socket.heartbeatClock = setInterval(() => {
            const diff = Date.now() - socket.heartbeatTime;
            if (diff > intervalTime + this.config.heartbeatErrorMargin) {
                this.config.debug('HEALTH CHECK failed! Closing', diff, intervalTime);
                socket.close();
            }
            else {
                this.config.debug('HEALTH CHECK ok!', diff, intervalTime);
                socket.heartbeatTime -= diff;
            }
        }, intervalTime);
    }
    heartbeatOff(socket) {
        if (socket.heartbeatClock) {
            clearInterval(socket.heartbeatClock);
            socket.heartbeatClock = undefined;
        }
    }
    afterConnectionClose(socket) {
        // remove from subscribes
        this.subscribers = this.subscribers
            .filter(subscriber => subscriber.sessionId !== socket.sessionId);
        // turn off server side heart-beat (if needed)
        this.heartbeatOff(socket);
    }
}
exports.Server = Server;
exports.default = Server;
