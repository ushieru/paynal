"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVER_FRAMES = void 0;
const cuid_1 = __importDefault(require("cuid"));
const core_1 = require("@paynal/core");
exports.SERVER_FRAMES = {
    CONNECTED: (socket, heartbeat, serverName) => {
        const headers = {
            session: socket.sessionId,
            server: serverName,
            'heart-beat': heartbeat,
            version: '1.2'
        };
        return new core_1.Frame('CONNECTED', headers);
    },
    MESSAGE: (subscription, destination, body, headers) => {
        return new core_1.Frame('MESSAGE', Object.assign({ 'message-id': (0, cuid_1.default)(), subscription,
            destination }, headers), body);
    },
    RECEIPT: (receipt) => {
        return new core_1.Frame('RECEIPT', { 'receipt-id': receipt });
    },
    ERROR: (message, description) => {
        const len = description === undefined ? 0 : description.length;
        const headers = {
            message: message,
            'content-type': 'text/plain',
            'content-length': len
        };
        return new core_1.Frame('ERROR', headers, description);
    }
};
