import { ClientConfig } from "../@types/client-config"
import { Frame, CLIENT_FRAMES, Headers } from "@paynal/core"

interface ClientParams {
    url: string | URL
    protocols?: string | string[] | undefined
    config?: ClientConfig
}

export class Client {
    private webSocket: WebSocket
    private isConnected = false;
    // private readonly maxWebSocketFrameSize = 16 * 1024 TODO: hacerlo configurable
    private subscriptions: { [x: string]: (frame: Frame) => void } = {}
    private readonly debug: (message?: any, ...optionalParams: any[]) => void
    private heartbeat: [number, number]
    private heartbeatTime: number = 0
    private connectedCallback?: (frame: Frame) => void

    constructor({ url, protocols, config }: ClientParams) {
        this.webSocket = new WebSocket(url, protocols)
        this.debug = config?.debug ?? console.log
        this.heartbeat = config?.heartbeat ?? [10000, 10000]
    }

    connect(login: string, passcode: string, callback?: (frame: Frame) => void) {
        if (this.isConnected) throw "You'r already connected"
        const connectFrame = CLIENT_FRAMES.CONNECT(login, passcode)
        this.connectedCallback = callback
        this.sendFrame(connectFrame)
        this.webSocket.addEventListener('message', (event) => this.parseRequest(event.data))
    }

    /**
     * Implementar heart beat checker
     */
    private setupHeartbeat() { }

    private parseRequest(data: string): void {
        const frame = Frame.fromPayload(data)
        switch (frame.command) {
            case 'CONNECTED':
                this.debug()
                this.isConnected = true
                if (this.connectedCallback) this.connectedCallback(frame)
                break;
            case 'MESSAGE':
                const subscription = frame.headers.subscription.toString()
                const listener = this.subscriptions[subscription]
                if (listener) listener(frame)
                break;
            case 'RECEIPT':
                break;
            case 'ERROR':
                break;
            default:
                this.debug(`Unhandled command on frame::\n-----\n${frame.build()}\n-----`)
                break;
        }
    }

    private sendFrame(frame: Frame) {
        this.webSocket.send(frame.build())
    }

    send(destination: string, headers: Headers, body?: string) {
        const frame = CLIENT_FRAMES.SEND(destination, headers, body)
        this.sendFrame(frame)
    }

    subscribe(destination: string, callback: (frame: Frame) => void, headers: Headers = {}) {
        const frame = CLIENT_FRAMES.SUBSCRIBE(destination, headers)
        const subscriptionId = frame.headers.id.toString()
        this.subscriptions[subscriptionId] = callback
        console.log('[subscribe]::\n', frame)
        this.sendFrame(frame)
        return () => this.unsubscribe(subscriptionId)
    }

    unsubscribe(id: string) {
        const frame = CLIENT_FRAMES.UNSUBSCRIBE(id)
        this.sendFrame(frame)
    }

    begin() { }

    commit() { }

    abort() { }

    ack() { }

    nack() { }

    get connected(): boolean {
        return this.isConnected
    }
}
