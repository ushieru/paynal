import type { Headers } from '../@types/headers';
export declare class Frame {
    readonly command: string;
    readonly headers: Headers;
    readonly body?: string | undefined;
    readonly wantReceipt: boolean;
    constructor(command: string, headers: Headers, body?: string | undefined, wantReceipt?: boolean);
    static fromPayload(payload: string): Frame;
    build(): string;
    toString(): string;
}
