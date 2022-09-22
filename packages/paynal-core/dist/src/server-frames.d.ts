import { Frame } from './frame';
import { Headers } from '../@types/headers';
export declare const SERVER_FRAMES: {
    CONNECTED: (sessionId: string, heartbeat: string, serverName: string) => Frame;
    MESSAGE: (subscription: string, destination: string, body?: string, headers?: Headers) => Frame;
    RECEIPT: (receipt: string) => Frame;
    ERROR: (message: string, description: string) => Frame;
};
