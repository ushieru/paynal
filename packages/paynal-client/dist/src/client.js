"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const core_1 = require("@paynal/core");
class Client {
    constructor({ url, protocols, config }) {
        var _a, _b;
        this.isConnected = false;
        // private readonly maxWebSocketFrameSize = 16 * 1024 TODO: hacerlo configurable
        this.subscriptions = {};
        this.heartbeatTime = 0;
        this.webSocket = new WebSocket(url, protocols);
        this.debug = (_a = config === null || config === void 0 ? void 0 : config.debug) !== null && _a !== void 0 ? _a : console.log;
        this.heartbeat = (_b = config === null || config === void 0 ? void 0 : config.heartbeat) !== null && _b !== void 0 ? _b : [10000, 10000];
    }
    connect(login, passcode, callback) {
        if (this.isConnected)
            throw "You'r already connected";
        const connectFrame = core_1.CLIENT_FRAMES.CONNECT(login, passcode);
        this.connectedCallback = callback;
        this.sendFrame(connectFrame);
        this.webSocket.addEventListener('message', (event) => this.parseRequest(event.data));
    }
    /**
     * Implementar heart beat checker
     */
    setupHeartbeat() { }
    parseRequest(data) {
        const frame = core_1.Frame.fromPayload(data);
        switch (frame.command) {
            case 'CONNECTED':
                this.debug();
                this.isConnected = true;
                if (this.connectedCallback)
                    this.connectedCallback(frame);
                break;
            case 'MESSAGE':
                const subscription = frame.headers.subscription.toString();
                const listener = this.subscriptions[subscription];
                if (listener)
                    listener(frame);
                break;
            case 'RECEIPT':
                break;
            case 'ERROR':
                break;
            default:
                this.debug(`Unhandled command on frame::\n-----\n${frame.build()}\n-----`);
                break;
        }
    }
    sendFrame(frame) {
        this.webSocket.send(frame.build());
    }
    send(destination, headers, body) {
        const frame = core_1.CLIENT_FRAMES.SEND(destination, headers, body);
        this.sendFrame(frame);
    }
    subscribe(destination, callback, headers = {}) {
        const frame = core_1.CLIENT_FRAMES.SUBSCRIBE(destination, headers);
        const subscriptionId = frame.headers.id.toString();
        this.subscriptions[subscriptionId] = callback;
        console.log('[subscribe]::\n', frame);
        this.sendFrame(frame);
        return () => this.unsubscribe(subscriptionId);
    }
    unsubscribe(id) {
        const frame = core_1.CLIENT_FRAMES.UNSUBSCRIBE(id);
        this.sendFrame(frame);
    }
    begin() { }
    commit() { }
    abort() { }
    ack() { }
    nack() { }
    get connected() {
        return this.isConnected;
    }
}
exports.Client = Client;
