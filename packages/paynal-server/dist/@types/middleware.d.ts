import type { WebSocket } from './web-socket';
export declare type Middleware = (socket: WebSocket, args: any, callback?: (message?: any, ...optionalParams: any[]) => void) => void;
