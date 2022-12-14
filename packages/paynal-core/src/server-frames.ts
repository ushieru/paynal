import cuid from 'cuid'
import { Frame } from './frame'
import { Headers } from '../@types/headers'

export const SERVER_FRAMES = {
    CONNECTED: (sessionId: string, heartbeat: string, serverName: string): Frame => {
        const headers = {
            session: sessionId,
            server: serverName,
            'heart-beat': heartbeat,
            version: '1.2'
        }
        return new Frame('CONNECTED', headers)
    },
    MESSAGE: (subscription: string, destination: string, body?: string, headers?: Headers): Frame => {
        return new Frame('MESSAGE',
            {
                'message-id': cuid(),
                subscription,
                destination,
                ...headers
            },
            body
        )
    },
    RECEIPT: (receipt: string): Frame => {
        return new Frame('RECEIPT', { 'receipt-id': receipt })
    },
    ERROR: (message: string, description: string): Frame => {
        const len = description === undefined ? 0 : description.length
        const headers = {
            message: message,
            'content-type': 'text/plain',
            'content-length': len
        }
        return new Frame('ERROR', headers, description)
    }
}
