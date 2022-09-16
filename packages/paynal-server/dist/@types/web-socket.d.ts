/// <reference types="node" />
import { WebSocket as WS } from 'ws';
import { Frame } from '@paynal/core';
export declare class WebSocket extends WS {
    sessionId: string;
    clientHeartbeat: any;
    heartbeatTime: number;
    heartbeatClock?: NodeJS.Timer;
    static fromWebSocket(webSocket: any): WebSocket;
    sendFrame(_frame: Frame): void;
}
