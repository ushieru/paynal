"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocket = void 0;
const ws_1 = require("ws");
class WebSocket extends ws_1.WebSocket {
    constructor() {
        super(...arguments);
        this.sessionId = '';
        this.heartbeatTime = 0;
    }
    static fromWebSocket(webSocket) {
        webSocket.sessionId = '';
        webSocket.clientHeartbeat = [0, 0];
        webSocket.heartbeatTime = 0;
        webSocket.sendFrame = (frame) => {
            webSocket.send(frame.build());
        };
        return webSocket;
    }
    sendFrame(_frame) { }
}
exports.WebSocket = WebSocket;
