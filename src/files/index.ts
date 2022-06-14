import { createWriteStream } from "fs"
import { createServer } from "http"
import { mergeMap, EMPTY } from "rxjs"
import { Encoding } from "../types"
import { createLogger } from "../utils/createLogger"
import { getQuery } from "../utils/getQuery"
import { suppres, side, readdir, readFile, stat, writeFile } from "../utils/rxBindings"

const logFile = '/tmp/logfile'

const { info, err } = createLogger(
	createWriteStream(logFile, {
		flags: 'a',
		encoding: Encoding.Utf8,
		mode: 0o666
	})
)

createServer((req, res) => {
	const { dir, from, to } = getQuery(req)

	readdir(...dir).pipe(
		suppres((error) => {
			err(error)
		}),
		side((files) => {
			info(`${files} readed`)
		}),
		mergeMap((contents) => stat(...contents)),
		suppres((error) => {
			err(error)
		}),
		side(({ path }) => {
			info(`Stat for path "${path}" received`)
		}),
		mergeMap(({ path, stats }) => stats.isFile() ? readFile(path) : EMPTY),
		suppres((error) => {
			err(error)
		}),
		side(({ path }) => {
			info(`File "${path}" readed`)
		}),
		mergeMap(({ path, content }) => writeFile({ path, content: content.replace(from, to) })),
		suppres((error) => {
			err(error)
		}),
		side((path) => {
			info(`Changed "${path}" from "${from}" to "${to}"`)
		})
	).subscribe({
		complete() {
			info('Process ended')
			res.end()
		}
	})
}).listen(8080)

console.log('Server started')
