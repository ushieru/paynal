"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSubMatchDestination = exports.tokenizeDestination = void 0;
const tokenizeDestination = (dest) => {
    return dest.slice(dest.indexOf('/') + 1).split('.');
};
exports.tokenizeDestination = tokenizeDestination;
const checkSubMatchDestination = (subscriber, dest) => {
    let match = true;
    const tokens = (0, exports.tokenizeDestination)(dest);
    for (let t in tokens) {
        const token = tokens[t];
        if (subscriber.tokens[t] === undefined || (subscriber.tokens[t] !== token && subscriber.tokens[t] !== '*' && subscriber.tokens[t] !== '**')) {
            match = false;
            break;
        }
        else if (subscriber.tokens[t] === '**') {
            break;
        }
    }
    return match;
};
exports.checkSubMatchDestination = checkSubMatchDestination;
