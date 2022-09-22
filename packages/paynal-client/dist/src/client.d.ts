import { ClientConfig } from "../@types/client-config";
import { Frame, Headers } from "@paynal/core";
interface ClientParams {
    url: string | URL;
    protocols?: string | string[] | undefined;
    config?: ClientConfig;
}
export declare class Client {
    private webSocket;
    private isConnected;
    private subscriptions;
    private readonly debug;
    private heartbeat;
    private heartbeatTime;
    private connectedCallback?;
    constructor({ url, protocols, config }: ClientParams);
    connect(login: string, passcode: string, callback?: (frame: Frame) => void): void;
    /**
     * Implementar heart beat checker
     */
    private setupHeartbeat;
    private parseRequest;
    private sendFrame;
    send(destination: string, headers: Headers, body?: string): void;
    subscribe(destination: string, callback: (frame: Frame) => void, headers?: Headers): () => void;
    unsubscribe(id: string): void;
    begin(): void;
    commit(): void;
    abort(): void;
    ack(): void;
    nack(): void;
    get connected(): boolean;
}
export {};
