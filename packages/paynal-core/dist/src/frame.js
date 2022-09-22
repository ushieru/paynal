"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Frame = void 0;
const cuid_1 = __importDefault(require("cuid"));
const bytes_1 = require("./bytes");
const trimNull_1 = require("./trimNull");
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
        const [commandAndHeaders, rawBody] = payload.split(`${bytes_1.Break}${bytes_1.Break}`);
        const [command, ...strHeaders] = commandAndHeaders.split(bytes_1.Break);
        const body = (0, trimNull_1.trimNull)(rawBody);
        const headers = {};
        strHeaders.forEach((strHeader) => {
            const [key, value] = strHeader.split(':');
            headers[key] = value;
        });
        return new Frame(command, headers, body);
    }
    build() {
        const frameBuilder = [];
        const headersBuilder = Object.entries(this.headers)
            .map(([headerKey, headerValue]) => `${headerKey}:${headerValue}`);
        frameBuilder.push(this.command);
        frameBuilder.push(headersBuilder.join(bytes_1.Break));
        frameBuilder.push(bytes_1.Break);
        if (this.body)
            frameBuilder.push(this.body);
        frameBuilder.push(bytes_1.Null);
        return frameBuilder.join(bytes_1.Break);
    }
    toString() {
        return this.build().toString();
    }
}
exports.Frame = Frame;
