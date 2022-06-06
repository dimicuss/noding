import { createServer } from "net";

const server = createServer((socket) => {
	socket.on('data', (data) => {
		console.log(`Received ${data}`)
		socket.write(data)
	})

	socket.on('close', () => {
		console.log('Connection closed')
	})
})

server.listen(8140)

console.log('Server started')



