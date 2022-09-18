"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Frame = void 0;
const cuid_1 = __importDefault(require("cuid"));
const buffer_1 = require("buffer/");
const bytes_1 = require("./bytes");
class Frame {
    constructor(command, headers, body, wantReceipt = false) {
        this.command = command;
        this.headers = headers;
        this.body = body;
        this.wantReceipt = wantReceipt;
        if (wantReceipt)
            /**
             * Todo: Revisar si es necesario tener session
             * para pedir un resivo
             */
            // if (this.headers.session)
            this.headers.receipt = `${(0, cuid_1.default)()}-${this.headers.session}`;
    }
    static fromPayload(payload) {
        if (!payload)
            throw 'Payload is empty';
        if (typeof payload == 'string')
            payload = buffer_1.Buffer.from(payload);
        const command = Frame.parseCommand(payload);
        const data = payload.subarray(command.length + 1, payload.length);
        const dataStr = data.toString().slice(0, data.length);
        const headersAndBody = dataStr.split(`${bytes_1.Break}${bytes_1.Break}`);
        const headers = Frame.parseHeaders(headersAndBody[0]);
        const body = headersAndBody.slice(1, headersAndBody.length);
        if ('content-length' in headers)
            headers.bytes_message = true;
        if (body && headers['content-type'] === 'application/json')
            return new Frame(command, headers, JSON.parse(Frame.trimNull(body.toString())));
        return new Frame(command, headers, Frame.trimNull(body.toString()));
    }
    makeBuffer(headers, body) {
        const buffers = [buffer_1.Buffer.from(headers), body];
        return buffer_1.Buffer.concat(buffers);
    }
    static parseCommand(payload) {
        const payloadStr = payload.toString('utf8', 0, payload.length);
        const command = payloadStr.split(bytes_1.Break);
        return command[0];
    }
    static trimNull(payload) {
        const c = payload.indexOf(bytes_1.Null);
        if (c > -1)
            return payload.slice(0, c);
        return payload;
    }
    static parseHeaders(rawHeaders) {
        var _a;
        const headers = {};
        const headersSplit = rawHeaders.split(bytes_1.Break);
        for (let i = 0; i < headersSplit.length; i++) {
            const header = headersSplit[i].split(':');
            if (header && header.length > 1) {
                const key = (_a = header.shift()) === null || _a === void 0 ? void 0 : _a.trim();
                if (key)
                    headers[key] = header.join(':').trim();
                continue;
            }
            if (header[1]) {
                headers[header[0].trim()] = header[1].trim();
            }
        }
        return headers;
    }
    build() {
        const frameBuilder = [];
        const headersBuilder = Object.entries(this.headers)
            .map(([headerKey, headerValue]) => `${headerKey}:${headerValue}`);
        frameBuilder.push(`${this.command}${bytes_1.Break}`);
        frameBuilder.push(headersBuilder.join(bytes_1.Break));
        frameBuilder.push(`${bytes_1.Break}${bytes_1.Break}`);
        if (this.body) {
            if (buffer_1.Buffer.isBuffer(this.body))
                return this.makeBuffer(frameBuilder.join(bytes_1.Break), this.body);
            else if (typeof this.body == 'string')
                frameBuilder.push(this.body);
            else if (this.body)
                frameBuilder.push(JSON.stringify(this.body));
        }
        frameBuilder.push(bytes_1.Null);
        return frameBuilder.join(bytes_1.Break);
    }
    toString() {
        return this.build().toString();
    }
}
exports.Frame = Frame;
