import { createServer, ServerResponse } from "http";
import { createList } from "../utils/createList";
import { defaultString } from "../utils/defaults";
import { parse } from "../utils/parse";
import { readFiles } from "../utils/readFiles";

function writeNumbers(res: ServerResponse) {
	let counter = 0;
	for (let i = 0; i <= 100; i++) {
		res.write(`${counter}\n`)
		counter++
	}
}

function formatResponseData(data: string) {
	return `\n\n${data}\n\n`
}

createServer((req, res) => {
	const url = defaultString(req?.url)
	const parsedQuery = parse(url)

	res.writeHead(200, { 'Content-type': 'text/plain' })

	writeNumbers(res)

	readFiles(
		createList(parsedQuery.file),
		(data) => {
			console.log('File sended')
			res.write(formatResponseData(data))
		},
		(err) => {
			res.write(formatResponseData(err.message))
		},
		() => {
			res.end()
		}
	)
})
	.listen(8080)

console.log('Server started')
