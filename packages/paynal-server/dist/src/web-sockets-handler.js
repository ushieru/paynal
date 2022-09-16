"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketsHandler = void 0;
const core_1 = require("@paynal/core");
class WebSocketsHandler {
    constructor(server, config) {
        this.server = server;
        this.config = config;
    }
    CONNECT(socket, frame) {
        // setup heart-beat feature
        const rawHeartbeat = frame.headers['heart-beat'];
        let clientHeartbeat = [0, 0];
        if (rawHeartbeat) {
            clientHeartbeat = rawHeartbeat.toString().split(',').map((x) => parseInt(x));
        }
        // default server heart-beat answer
        const serverHeartbeat = [0, 0];
        // check preferred heart-beat direction: client → server
        if (clientHeartbeat[0] > 0 && this.server.config.heartBeat[1] > 0) {
            serverHeartbeat[1] = Math.max(clientHeartbeat[0], this.server.config.heartBeat[1]);
            this.server.heartbeatOn(socket, serverHeartbeat[1], false);
        }
        // check non-preferred heart-beat direction: server → client
        else if (clientHeartbeat[1] > 0 && this.server.config.heartBeat[0] > 0) {
            serverHeartbeat[0] = Math.max(clientHeartbeat[1], this.server.config.heartBeat[0]);
            this.server.heartbeatOn(socket, serverHeartbeat[0], true);
        }
        this.server.onClientConnected(socket, {
            heartbeat: clientHeartbeat,
            headers: frame.headers
        });
        const connectedFrame = core_1.SERVER_FRAMES.CONNECTED(socket.sessionId, serverHeartbeat.join(','), this.config.serverName);
        socket.sendFrame(connectedFrame);
    }
    DISCONNECT(socket, frame) {
        const receipt = frame.headers.receipt;
        this.server.disconnectClient(socket, receipt);
        const receipFrame = core_1.SERVER_FRAMES.RECEIPT(receipt.toString());
        socket.sendFrame(receipFrame);
    }
    SUBSCRIBE(socket, frame) {
        var _a, _b;
        const dest = frame.headers.destination.toString();
        /**
         * The valid values for the ack header are **auto**, **client**, or **client-individual**. If the header is not set, it defaults to auto.
         * Please check [SUBSCRIBE Doc](https://stomp.github.io/stomp-specification-1.2.html#SUBSCRIBE)
         */
        const ack = ((_b = (_a = frame.headers) === null || _a === void 0 ? void 0 : _a.ack) === null || _b === void 0 ? void 0 : _b.toString()) || 'auto';
        this.server.subscribeClient(socket, {
            dest, id: frame.headers.id.toString()
        });
    }
    UNSUBSCRIBE(socket, frame) {
        const id = frame.headers.id.toString();
        this.server.unsubscribeClient(socket, { id });
    }
    SEND(socket, frame) {
        if (!frame.headers.destination)
            return socket.sendFrame(core_1.SERVER_FRAMES.ERROR('Header destination is required', `Header destination not found:\n-----\n${frame.build()}\n-----`));
        this.server.sendClient(socket, frame.headers.destination.toString(), frame, (res) => {
            if (res && frame.headers.receipt)
                return socket.sendFrame(core_1.SERVER_FRAMES.RECEIPT(frame.headers.receipt.toString()));
            if (!res)
                socket.sendFrame(core_1.SERVER_FRAMES.ERROR('Send error', frame.toString()));
        });
    }
}
exports.WebSocketsHandler = WebSocketsHandler;
