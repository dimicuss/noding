import { createWriteStream } from "fs";
import { createServer } from "http";
import { mergeMap, EMPTY } from "rxjs";
import { Encoding } from "../types";
import { getQuery } from "../utils/parse";
import { readdir, readFile, stat, writeFile } from "../utils/rxBindings";

const logFile = '/tmp/logfile'

createServer((req, res) => {
	const { dir, from, to } = getQuery(req)

	const writeStream = createWriteStream(logFile, {
		flags: 'a',
		encoding: Encoding.Utf8,
		mode: 0o666
	})

	readdir(...dir).pipe(
		mergeMap((contents) => stat(...contents)),
		mergeMap(({ path, stats }) => stats.isFile() ? readFile(path) : EMPTY),
		mergeMap(({ path, content }) => writeFile({
			path,
			content: content.replace(from, to)
		})),
	).subscribe({
		next(path) {
			console.log(`LOG: Modified ${path}`)
			writeStream.write(`Changed ${path} on ${new Date()}\n`, Encoding.Utf8)
		},
		error(err) {
			res.end()
			writeStream.end()
			console.error(`ERROR: ${err}`)
		},
		complete() {
			res.end()
			writeStream.end()
			console.log('LOG: Query complete')
		}
	});
}).listen(8080)

console.log('Server started')
