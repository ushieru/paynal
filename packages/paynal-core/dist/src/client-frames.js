"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIENT_FRAMES = void 0;
const cuid_1 = __importDefault(require("cuid"));
const frame_1 = require("./frame");
exports.CLIENT_FRAMES = {
    CONNECT: (login, passcode) => {
        const headers = {
            'accept-version': 1.2,
            /**
             * TODO: revisar la documentacion antes de agregar heart-beat
             * [Heart-beating Doc](https://stomp.github.io/stomp-specification-1.2.html#Heart-beating)
             */
            // 'heart-beat': 0, 0
            login,
            passcode
        };
        return new frame_1.Frame('CONNECT', headers);
    },
    STOMP: (login, passcode) => {
        const headers = {
            'accept-version': 1.2,
            /**
             * TODO: revisar la documentacion antes de agregar heart-beat
             * [Heart-beating Doc](https://stomp.github.io/stomp-specification-1.2.html#Heart-beating)
             */
            // 'heart-beat': 0, 0
            login,
            passcode
        };
        return new frame_1.Frame('STOMP', headers);
    },
    SEND: (destination, headers, body) => {
        headers.destination = destination;
        if (body)
            headers['content-length'] = body.length;
        return new frame_1.Frame('SEND', headers, body);
    },
    SUBSCRIBE: (destination, headers) => {
        headers.destination = destination;
        headers.id = (0, cuid_1.default)();
        /**
         * TODO: revisar la documentacion de ack
         */
        // headers.ack = 'client'
        return new frame_1.Frame('SUBSCRIBE', headers);
    },
    UNSUBSCRIBE: (id) => {
        return new frame_1.Frame('UNSUBSCRIBE', { id });
    },
    BEGIN: (transaction, headers) => {
        headers.transaction = transaction;
        return new frame_1.Frame('BEGIN', headers);
    },
    COMMIT: (transaction, headers) => {
        headers.transaction = transaction;
        return new frame_1.Frame('COMMIT', headers);
    },
    ABORT: (transaction, headers) => {
        headers.transaction = transaction;
        return new frame_1.Frame('ABORT', {});
    },
    ACK: (id, headers, transaction) => {
        headers.id = id;
        if (transaction)
            headers.transaction = transaction;
        return new frame_1.Frame('ACK', headers);
    },
    NACK: (id, headers, transaction) => {
        headers.id = id;
        if (transaction)
            headers.transaction = transaction;
        return new frame_1.Frame('NACK', headers);
    },
    DISCONNECT: (receipt) => {
        return new frame_1.Frame('DISCONNECT', { receipt });
    },
};
