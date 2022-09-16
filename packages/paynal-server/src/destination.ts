import type { Subscriber } from '../@types'

export const tokenizeDestination = (dest: string): string[] => {
    return dest.slice(dest.indexOf('/') + 1).split('.')
}

export const checkSubMatchDestination = (subscriber: Subscriber, dest: string): boolean => {
    let match = true
    const tokens = tokenizeDestination(dest)
    for (let t in tokens) {
        const token = tokens[t]
        if (subscriber.tokens[t] === undefined || (subscriber.tokens[t] !== token && subscriber.tokens[t] !== '*' && subscriber.tokens[t] !== '**')) {
            match = false
            break
        } else if (subscriber.tokens[t] === '**') {
            break
        }
    }
    return match
}
