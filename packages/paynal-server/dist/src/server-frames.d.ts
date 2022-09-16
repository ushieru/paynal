import { Frame, Headers } from '@paynal/core';
import { WebSocket } from '../@types';
export declare const SERVER_FRAMES: {
    CONNECTED: (socket: WebSocket, heartbeat: string, serverName: string) => Frame;
    MESSAGE: (subscription: string, destination: string, body?: any, headers?: Headers) => Frame;
    RECEIPT: (receipt: string) => Frame;
    ERROR: (message: string, description: string) => Frame;
};
