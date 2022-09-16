import { Frame } from './frame';
import { Headers } from '../@types/headers';
export declare const CLIENT_FRAMES: {
    CONNECT: (login: string, passcode: string) => Frame;
    STOMP: (login: string, passcode: string) => Frame;
    SEND: (destination: string, headers: Headers, body: any) => Frame;
    SUBSCRIBE: (destination: string, headers: Headers) => Frame;
    UNSUBSCRIBE: (id: string) => Frame;
    BEGIN: (transaction: string, headers: Headers) => Frame;
    COMMIT: (transaction: string, headers: Headers) => Frame;
    ABORT: (transaction: string, headers: Headers) => Frame;
    ACK: (id: string, headers: Headers, transaction?: string) => Frame;
    NACK: (id: string, headers: Headers, transaction?: string) => Frame;
    DISCONNECT: (receipt: string) => Frame;
};
