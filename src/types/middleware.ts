import type { WebSocket } from './web-socket'

export type Middleware = (socket: WebSocket, args: any, callback?: (message?: any, ...optionalParams: any[]) => void) => void
