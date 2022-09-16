import http from 'http'
import Server from './src/server'
const stomp = require('stompjs')

const server = http.createServer();
const stompServer = new Server({ server: server, debug: console.log });

server.listen(2997)

const main = () => {
    stompServer.subscribe("/**", (msg, headers) => {
        // console.log('Colibri::' + '\n\t' + JSON.stringify(headers) + '\n\t' + msg)
    })

    const ws = stomp.overWS('ws://localhost:2997/ws')

    setTimeout(() => {
        const unsubscribe = ws.subscribe("/**", () => { })
    }, 2000)

    setTimeout(() => {
        stompServer.sendMessage('/test', {}, 'testMsg')
        ws.send('/client/test', {}, 'Body test')
    }, 4000)

}

server.on('listening', main)
