import { WebSocket } from "./web-socket"

export interface Subscriber {
    id: string
    sessionId: string
    topic: string
    tokens: string[]
    socket: WebSocket
}
