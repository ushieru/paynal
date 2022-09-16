import { WebSocket as WS } from 'ws'
import { Frame } from '@paynal/core'

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

    sendFrame(_frame: Frame): void { }
}
