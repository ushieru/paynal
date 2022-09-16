// @vitest-environment node
import { expect, test, describe } from 'vitest'
import { Frame } from '../src/frame'

describe('Frame test', () => {
    test('Build frame from string', () => {
        const payload = 'CONNECT\nlogin:guest\npasscode:guest\n\nbody\x00'

        const frame = Frame.fromPayload(payload)

        expect(frame.command).toBe('CONNECT')
        expect(frame.headers).toStrictEqual({ login: 'guest', passcode: 'guest' })
        expect(frame.body).toBe('body')
    })

    test('Build frame from Buffer', () => {
        const payload = Buffer.from('CONNECT\nlogin:guest\npasscode:guest\n\nbody\x00')

        const frame = Frame.fromPayload(payload)

        expect(frame.command).toBe('CONNECT')
        expect(frame.headers).toStrictEqual({ login: 'guest', passcode: 'guest' })
        expect(frame.body).toBe('body')
    })

    test('Build frame from constructor', () => {
        const frame = new Frame('CONNECT', { login: 'guest', passcode: 'guest' }, 'body')

        expect(frame.command).toBe('CONNECT')
        expect(frame.headers).toStrictEqual({ login: 'guest', passcode: 'guest' })
        expect(frame.body).toBe('body')
    })

    test('Build frame from string with json body', () => {
        const payload = Buffer.from('SEND\ndestination:/queue/a\ncontent-type:application/json\n\n{"hello":"world"}\x00')

        const frame = Frame.fromPayload(payload)

        expect(frame.command).toBe('SEND')
        expect(frame.headers).toStrictEqual({ destination: '/queue/a', 'content-type': 'application/json' })
        expect((frame.body as object).hello).toBe('world')
    })
})
