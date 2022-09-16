import { Frame } from '@paynal/core'
import { SecureConfig, WebSocket } from '../@types'
import { Server } from './server'
import { SERVER_FRAMES } from './server-frames'

export class WebSocketsHandler {

    constructor(
        readonly server: Server,
        readonly config: SecureConfig
    ) { }

    CONNECT(socket: WebSocket, frame: Frame) {
        // setup heart-beat feature
        const rawHeartbeat = frame.headers['heart-beat']
        let clientHeartbeat = [0, 0]
        if (rawHeartbeat) {
            clientHeartbeat = rawHeartbeat.toString().split(',').map((x) => parseInt(x))
        }
        // default server heart-beat answer
        const serverHeartbeat = [0, 0]
        // check preferred heart-beat direction: client → server
        if (clientHeartbeat[0] > 0 && this.server.config.heartBeat[1] > 0) {
            serverHeartbeat[1] = Math.max(clientHeartbeat[0], this.server.config.heartBeat[1])
            this.server.heartbeatOn(socket, serverHeartbeat[1], false)
        }
        // check non-preferred heart-beat direction: server → client
        else if (clientHeartbeat[1] > 0 && this.server.config.heartBeat[0] > 0) {
            serverHeartbeat[0] = Math.max(clientHeartbeat[1], this.server.config.heartBeat[0])
            this.server.heartbeatOn(socket, serverHeartbeat[0], true)
        }
        this.server.onClientConnected(socket, {
            heartbeat: clientHeartbeat,
            headers: frame.headers
        })
        const connectedFrame = SERVER_FRAMES.CONNECTED(socket, serverHeartbeat.join(','), this.config.serverName)
        socket.sendFrame(connectedFrame)
    }

    DISCONNECT(socket: WebSocket, frame: Frame) {
        const receipt = frame.headers.receipt
        this.server.disconnectClient(socket, receipt)
        const receipFrame = SERVER_FRAMES.RECEIPT(receipt.toString())
        socket.sendFrame(receipFrame)
    }

    SUBSCRIBE(socket: WebSocket, frame: Frame) {
        const dest = frame.headers.destination.toString()
        /**
         * The valid values for the ack header are **auto**, **client**, or **client-individual**. If the header is not set, it defaults to auto.
         * Please check [SUBSCRIBE Doc](https://stomp.github.io/stomp-specification-1.2.html#SUBSCRIBE)
         */
        const ack = frame.headers?.ack?.toString() || 'auto'
        this.server.subscribeClient(socket, {
            dest, id: frame.headers.id.toString()
        })
    }

    UNSUBSCRIBE(socket: WebSocket, frame: Frame) {
        const id = frame.headers.id.toString()
        this.server.unsubscribeClient(socket, { id })
    }

    SEND(socket: WebSocket, frame: Frame) {
        if (!frame.headers.destination)
            return socket.sendFrame(
                SERVER_FRAMES.ERROR(
                    'Header destination is required',
                    `Header destination not found:\n-----\n${frame.build()}\n-----`
                )
            )
        this.server.sendClient(socket, frame.headers.destination.toString(), frame, (res) => {
            if (res && frame.headers.receipt)
                return socket.sendFrame(SERVER_FRAMES.RECEIPT(frame.headers.receipt.toString()))
            if (!res)
                socket.sendFrame(
                    SERVER_FRAMES.ERROR('Send error', frame.toString())
                )
        })
    }
}
