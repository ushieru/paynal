import { Frame } from '@paynal/core';
import { SecureConfig, WebSocket } from '../@types';
import { Server } from './server';
export declare class WebSocketsHandler {
    readonly server: Server;
    readonly config: SecureConfig;
    constructor(server: Server, config: SecureConfig);
    CONNECT(socket: WebSocket, frame: Frame): void;
    DISCONNECT(socket: WebSocket, frame: Frame): void;
    SUBSCRIBE(socket: WebSocket, frame: Frame): void;
    UNSUBSCRIBE(socket: WebSocket, frame: Frame): void;
    SEND(socket: WebSocket, frame: Frame): void;
}
