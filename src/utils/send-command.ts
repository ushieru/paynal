import cuid from 'cuid'
import { WebSocket, Headers } from './../types'
import { Frame } from './../frame'

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