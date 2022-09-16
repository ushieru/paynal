import cuid from 'cuid'
import { Frame, Headers } from '@paynal/core'
import { WebSocket } from '../../@types'

export const sendCommand = (
    socket: WebSocket,
    command: string,
    headers: Headers = {},
    body: string | Buffer = '',
    wantReceipt: boolean = false
): void => {
    if (wantReceipt === true)
        headers.receipt = cuid()
    const frame = new Frame(command, headers, body)
    socket.send(frame.build())
}
