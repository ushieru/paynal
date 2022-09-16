import { Headers } from '@paynal/core'
import { Server as HTTPServer } from "http"

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
