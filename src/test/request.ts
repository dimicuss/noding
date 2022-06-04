import { request } from "http";

const options = {
	host: 'localhost',
	port: 8080,
	path: '/?file=./scripts/watch&file=./scripts/watch',
	method: 'GET'
}

function processPublicTime() {
	console.log('Request end');
}

for (let i = 0; i < 2000; i++) {
	request(options, processPublicTime).end();
}

