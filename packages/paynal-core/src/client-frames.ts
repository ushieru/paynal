import cuid from 'cuid'
import { Frame } from './frame'
import { Headers } from '../@types/headers'

export const CLIENT_FRAMES = {
    CONNECT: (login: string, passcode: string): Frame => {
        const headers: Headers = {
            'accept-version': 1.2,
            /**
             * TODO: revisar la documentacion antes de agregar heart-beat
             * [Heart-beating Doc](https://stomp.github.io/stomp-specification-1.2.html#Heart-beating)
             */
            // 'heart-beat': 0, 0
            login,
            passcode
        }
        return new Frame('CONNECT', headers)
    },
    STOMP: (login: string, passcode: string): Frame => {
        const headers: Headers = {
            'accept-version': 1.2,
            /**
             * TODO: revisar la documentacion antes de agregar heart-beat
             * [Heart-beating Doc](https://stomp.github.io/stomp-specification-1.2.html#Heart-beating)
             */
            // 'heart-beat': 0, 0
            login,
            passcode
        }
        return new Frame('STOMP', headers)
    },
    SEND: (destination: string, headers: Headers, body?: string): Frame => {
        headers.destination = destination
        if (body) headers['content-length'] = body.length
        return new Frame('SEND', headers, body)
    },
    SUBSCRIBE: (destination: string, headers: Headers): Frame => {
        headers.destination = destination
        headers.id = cuid()
        /**
         * TODO: revisar la documentacion de ack
         */
        // headers.ack = 'client'
        return new Frame('SUBSCRIBE', headers)
    },
    UNSUBSCRIBE: (id: string): Frame => {
        return new Frame('UNSUBSCRIBE', { id })
    },
    BEGIN: (transaction: string, headers: Headers): Frame => {
        headers.transaction = transaction
        return new Frame('BEGIN', headers)
    },
    COMMIT: (transaction: string, headers: Headers): Frame => {
        headers.transaction = transaction
        return new Frame('COMMIT', headers)
    },
    ABORT: (transaction: string, headers: Headers): Frame => {
        headers.transaction = transaction
        return new Frame('ABORT', {})
    },
    ACK: (id: string, headers: Headers, transaction?: string): Frame => {
        headers.id = id
        if (transaction) headers.transaction = transaction
        return new Frame('ACK', headers)
    },
    NACK: (id: string, headers: Headers, transaction?: string): Frame => {
        headers.id = id
        if (transaction) headers.transaction = transaction
        return new Frame('NACK', headers)
    },
    DISCONNECT: (receipt: string): Frame => {
        return new Frame('DISCONNECT', { receipt })
    },
}
