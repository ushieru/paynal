import { WebSocket as WS } from 'ws'
import { Frame } from '../frame'

export class WebSocket extends WS {
    sessionId: string = ''
    clientHeartbeat: any
    heartbeatTime: number = 0
    heartbeatClock?: NodeJS.Timer

    static fromWebSocket(webSocket: any): WebSocket {
        webSocket.sessionId = ''
        webSocket.clientHeartbeat = [0, 0]
        webSocket.heartbeatTime = 0
        webSocket.sendFrame = (frame: Frame) => {
            webSocket.send(frame.build())
        }
        return webSocket
    }

    sendFrame(frame: Frame): void { }
}
