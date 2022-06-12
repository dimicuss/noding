import { createWriteStream } from "fs";
import { createServer } from "http";
import { mergeMap, EMPTY, tap } from "rxjs";
import { Encoding } from "../types";
import { createLogger } from "../utils/createLogger";
import { getQuery } from "../utils/getQuery";
import { readdir, readFile, stat, writeFile } from "../utils/rxBindings";

const logFile = '/tmp/logfile'

createServer((req, res) => {
	const { dir, from, to } = getQuery(req)

	const { log, err } = createLogger(
		createWriteStream(logFile, {
			flags: 'a',
			encoding: Encoding.Utf8,
			mode: 0o666
		})
	)

	readdir(dir, err).pipe(
		mergeMap((contents) => stat(contents, err)),
		mergeMap(({ path, stats }) => stats.isFile() ? readFile([path], err) : EMPTY),
		mergeMap(({ path, content }) => writeFile([{
			path,
			content: content.replace(from, to)
		}], err)),
		tap((path) => {
			log(`Changed ${path} on ${new Date()} from ${from} to ${to}`)
		})
	).subscribe({
		complete() {
			res.end()
			log('Query complete')
		}
	})
})
	.listen(8080)

console.log('Server started')
