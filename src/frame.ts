import cuid from 'cuid'
import type { Headers } from './types/headers'
import { Break, Null } from './bytes'

export class Frame {
    constructor(
        readonly command: string,
        readonly headers: Headers,
        readonly body?: any,
        readonly wantReceipt: boolean = false
    ) {
        if (wantReceipt)
            if (this.headers.session)
                this.headers.receipt = `${cuid()}-${this.headers.session}`
    }

    static fromPayload(payload: Buffer | string): Frame {
        if (!payload) throw 'Payload is empty'
        if (typeof payload == 'string') payload = Buffer.from(payload)
        const command = Frame.parseCommand(payload)
        const data = payload.subarray(command.length + 1, payload.length)
        const dataStr = data.toString('utf8', 0, data.length)
        const headersAndBody = dataStr.split(`${Break}${Break}`)
        const headers = Frame.parseHeaders(headersAndBody[0])
        const body = headersAndBody.slice(1, headersAndBody.length)
        if ('content-length' in headers) headers.bytes_message = true
        if (body && headers['content-type'] === 'application/json')
            return new Frame(command, headers, JSON.parse(Frame.trimNull(body.toString())))
        return new Frame(command, headers, Frame.trimNull(body.toString()))
    }

    private makeBuffer(headers: string, body: Buffer): Buffer {
        const buffers = [Buffer.from(headers), body]
        return Buffer.concat(buffers)
    }

    private static parseCommand(payload: Buffer): string {
        const payloadStr = payload.toString('utf8', 0, payload.length)
        const command = payloadStr.split(Break)
        return command[0]
    }

    private static trimNull(payload: string): string {
        const c = payload.indexOf(Null)
        if (c > -1) return payload.slice(0, c)
        return payload
    }

    private static parseHeaders(rawHeaders: string): Headers {
        const headers: Headers = {}
        const headersSplit = rawHeaders.split(Break)
        for (let i = 0; i < headersSplit.length; i++) {
            const header = headersSplit[i].split(':')
            if (header && header.length > 1) {
                const key = header.shift()?.trim()
                if (key) headers[key] = header.join(':').trim()
                continue
            }
            if (header[1]) {
                headers[header[0].trim()] = header[1].trim()
            }
        }
        return headers
    }

    build(): string | Buffer {
        const frameBuilder: string[] = []
        const headersBuilder = Object.entries(this.headers)
            .map(([headerKey, headerValue]) =>
                `${headerKey}:${headerValue}`)
        frameBuilder.push(`${this.command}${Break}`)
        frameBuilder.push(headersBuilder.join(Break))
        frameBuilder.push(`${Break}${Break}`)
        if (Buffer.isBuffer(this.body)) {
            return this.makeBuffer(frameBuilder.join(Break), this.body)
        }
        if (this.body && this.headers['content-type'] === 'application/json') {
            frameBuilder.push(JSON.stringify(this.body))
        }
        if (this.body && this.headers['content-type'] !== 'application/json') {
            frameBuilder.push(this.body)
        }
        frameBuilder.push(Null)
        return frameBuilder.join(Break)
    }

    toString(): string {
        return this.build().toString()
    }
}
