/// <reference types="node" />
import type { Headers } from '../@types/headers';
export declare class Frame {
    readonly command: string;
    readonly headers: Headers;
    readonly body?: any;
    readonly wantReceipt: boolean;
    constructor(command: string, headers: Headers, body?: any, wantReceipt?: boolean);
    static fromPayload(payload: Buffer | string): Frame;
    private makeBuffer;
    private static parseCommand;
    private static trimNull;
    private static parseHeaders;
    build(): string | Buffer;
    toString(): string;
}
