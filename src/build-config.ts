import { version } from '../package.json'
import { Config, SecureConfig } from './types'

export const buildConfig = (config: Config): SecureConfig => {
    if (config.server === undefined) throw 'Server is required'
    const secureConfig: SecureConfig = {
        server: config.server,
        serverName: config.serverName ?? 'Paynal/' + version,
        path: config.path ?? '/ws',
        heartBeat: config.heartBeat ?? [0, 0],
        heartbeatErrorMargin: config.heartbeatErrorMargin ?? 1000,
        debug: config.debug ?? (() => { }),
        protocol: config.protocol ?? 'ws',
        protocolConfig: config.protocolConfig ?? {}
    }
    return secureConfig
}
