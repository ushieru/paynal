// @vitest-environment happy-dom

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

    test('Build frame from constructor', () => {
        const frame = new Frame('CONNECT', { login: 'guest', passcode: 'guest' }, 'body')

        expect(frame.command).toBe('CONNECT')
        expect(frame.headers).toStrictEqual({ login: 'guest', passcode: 'guest' })
        expect(frame.body).toBe('body')
    })
})
