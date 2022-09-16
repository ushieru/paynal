"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildConfig = void 0;
const package_json_1 = require("../package.json");
const buildConfig = (config) => {
    var _a, _b, _c, _d, _e, _f, _g;
    if (config.server === undefined)
        throw 'Server is required';
    const secureConfig = {
        server: config.server,
        serverName: (_a = config.serverName) !== null && _a !== void 0 ? _a : 'Paynal/' + package_json_1.version,
        path: (_b = config.path) !== null && _b !== void 0 ? _b : '/ws',
        heartBeat: (_c = config.heartBeat) !== null && _c !== void 0 ? _c : [0, 0],
        heartbeatErrorMargin: (_d = config.heartbeatErrorMargin) !== null && _d !== void 0 ? _d : 1000,
        debug: (_e = config.debug) !== null && _e !== void 0 ? _e : (() => { }),
        protocol: (_f = config.protocol) !== null && _f !== void 0 ? _f : 'ws',
        protocolConfig: (_g = config.protocolConfig) !== null && _g !== void 0 ? _g : {}
    };
    return secureConfig;
};
exports.buildConfig = buildConfig;
