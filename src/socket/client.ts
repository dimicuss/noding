import { Socket } from "net";
import { Encoding } from "../types";

const socket = new Socket()
socket.setEncoding(Encoding.Utf8)

socket.connect(8140, 'localhost', () => {
	console.log('Client started')
});

process.stdin.resume()

process.stdin.on('data', (data) => {
	console.log(`Client Ping: ${data}`)
	socket.write(data)
})

socket.on('data', (data) => {
	console.log(`Server Pong: ${data}`)
})

socket.on('close', () => {
	console.log('Connection lost')
})
