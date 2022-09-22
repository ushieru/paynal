import { Headers } from '@paynal/core';
import { WebSocket } from '../../@types';
export declare const sendCommand: (socket: WebSocket, command: string, headers?: Headers, body?: string, wantReceipt?: boolean) => void;
