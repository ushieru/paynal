"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimNull = void 0;
const bytes_1 = require("./bytes");
const trimNull = (payload) => {
    const c = payload.indexOf(bytes_1.Null);
    if (c > -1)
        return payload.slice(0, c);
    return payload;
};
exports.trimNull = trimNull;
