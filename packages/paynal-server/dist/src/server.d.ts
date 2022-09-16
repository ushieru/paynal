/// <reference types="node" />
import EventEmitter from "events";
import { Server as WSServer } from 'ws';
import { Frame, Headers } from '@paynal/core';
import { WebSocket, Config, SecureConfig, Middleware, Command } from "../@types";
import { WebSocketsHandler } from './web-sockets-handler';
export declare class Server extends EventEmitter {
    readonly webSocketsHandler: WebSocketsHandler;
    readonly server: WSServer;
    private subscribers;
    readonly middlewares: {
        [x: string]: Middleware[];
    };
    readonly config: SecureConfig;
    private readonly selfSocket;
    constructor(config: Config);
    subscribe(topic: string, callback: (msg: string, headers: Headers) => void, headers?: Headers): {
        id: string;
        unsubscribe: () => void;
    };
    private unsubscribe;
    onClientConnected(socket: WebSocket, args: {
        heartbeat: number[];
        headers: Headers;
    }): void;
    private parseRequest;
    sendMessage(topic: string, headers?: Headers, body?: any): void;
    sendClient(socket: WebSocket, topic: string, frame: Frame, callback?: (res: boolean) => void): void;
    addMiddleware(command: Command, handler: Middleware): void;
    private withMiddleware;
    subscribeClient(socket: WebSocket, args: {
        dest: string;
        id: string;
    }): void;
    unsubscribeClient(socket: WebSocket, args: {
        id: string;
    }): void;
    disconnectClient(socket: WebSocket, args?: any): void;
    heartbeatOn(socket: WebSocket, intervalTime: number, serverSide: boolean): void;
    heartbeatOff(socket: WebSocket): void;
    afterConnectionClose(socket: WebSocket): void;
}
export default Server;
