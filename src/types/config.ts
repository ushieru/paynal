import { Server as HTTPServer } from "http"
import { Headers } from "./headers"

export interface Config {
    server: HTTPServer
    heartBeat?: [number, number]
    heartbeatErrorMargin?: number
    debug?: (message?: any, ...optionalParams: any[]) => void
    serverName?: string
    path?: string
    protocol?: string
    protocolConfig?: Headers
}

export interface SecureConfig {
    server: HTTPServer
    heartBeat: [number, number]
    heartbeatErrorMargin: number
    debug: (message?: any, ...optionalParams: any[]) => void
    serverName: string
    path: string
    protocol: string
    protocolConfig: Headers
}
