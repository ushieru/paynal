"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCommand = void 0;
const cuid_1 = __importDefault(require("cuid"));
const core_1 = require("@paynal/core");
const sendCommand = (socket, command, headers = {}, body = '', wantReceipt = false) => {
    if (wantReceipt === true)
        headers.receipt = (0, cuid_1.default)();
    const frame = new core_1.Frame(command, headers, body);
    socket.send(frame.build());
};
exports.sendCommand = sendCommand;
