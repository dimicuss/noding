import { createWriteStream } from "fs"
import { createServer } from "http"
import { mergeMap, EMPTY, of, map } from "rxjs"
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

	of(...dir).pipe(
		readdir,
		suppres((error) => {
			err(error)
		}),
		side((path) => {
			info(`${path} readed`)
		}),
		mergeMap((path) => of(path).pipe(
			stat,
			suppres((error) => {
				err(error)
			}),
			side(() => {
				info(`Stat for path "${path}"`)
			}),
			mergeMap((stats) => stats.isFile() ? of(path).pipe(readFile) : EMPTY),
			suppres((error) => {
				err(error)
			}),
			side(() => {
				info(`File "${path}" readed`)
			}),
			map((content) => ({ path, content: content.replace(from, to) })),
			writeFile,
			suppres((error) => {
				err(error)
			}),
			side(() => {
				info(`Changed "${path}" from "${from}" to "${to}"`)
			})
		))
	).subscribe({
		complete() {
			info('Process ended')
			res.end()
		}
	})
}).listen(8080)

console.log('Server started')
