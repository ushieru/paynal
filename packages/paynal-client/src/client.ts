import { ClientConfig } from "../../paynal-server/src/types"
import { CLIENT_FRAMES } from '../../paynal-server/src/client-frames'
import { Frame } from "../../paynal-core/src/frame"

export class Client extends WebSocket {
    private connected = false;
    private readonly maxWebSocketFrameSize = 16 * 1024
    private subscriptions: { [x: string]: string } = {}
    private readonly debug: (message?: any, ...optionalParams: any[]) => void
    private heartbeat: [number, number]
    private heartbeatTime: number = 0
    private connectedCallback?: (frame: Frame) => void

    constructor(url: string, kconfig?: ClientConfig) {
        super(url)
        this.debug = config?.debug ?? console.log
        this.heartbeat = config?.heartbeat ?? [10000, 10000]
    }

    connect(login: string, passcode: string, callback?: (frame: Frame) => void) {
        const connectFrame = CLIENT_FRAMES.CONNECT(login, passcode)
        this.connectedCallback = callback
        this.sendFrame(connectFrame)
        this.addEventListener('message', (data) => this.parseRequest)
    }

    /**
     * Implementar heart beat checker
     */
    private setupHeartbeat() { }

    private parseRequest(data: string | Buffer): void {
        const frame = Frame.fromPayload(data)
        switch (frame.command) {
            case 'CONNECTED':
                this.debug()
                this.connected = true
                if (this.connectedCallback) this.connectedCallback(frame)
                break;
            case 'MESSAGE':
                break;
            case 'RECEIPT':
                break;
            case 'ERROR':
                break;
            default:
                this.debug(`Unhandled command::${frame.command} `)
                break;
        }
    }

    private sendFrame(frame: Frame) {
        this.send(frame.build())
    }

}
