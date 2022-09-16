"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const server_1 = __importDefault(require("./src/server"));
const stomp = require('stompjs');
const server = http_1.default.createServer();
const stompServer = new server_1.default({ server: server, debug: console.log });
server.listen(2997);
const main = () => {
    stompServer.subscribe("/**", (msg, headers) => {
        // console.log('Colibri::' + '\n\t' + JSON.stringify(headers) + '\n\t' + msg)
    });
    const ws = stomp.overWS('ws://localhost:2997/ws');
    setTimeout(() => {
        const unsubscribe = ws.subscribe("/**", () => { });
    }, 2000);
    setTimeout(() => {
        stompServer.sendMessage('/test', {}, 'testMsg');
        ws.send('/client/test', {}, 'Body test');
    }, 4000);
};
server.on('listening', main);
