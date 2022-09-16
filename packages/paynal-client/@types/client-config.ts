export interface ClientConfig {
    debug?: (message?: any, ...optionalParams: any[]) => void
    heartbeat: [number, number]
}
