import { createWriteStream } from "fs"
import { createServer } from "http"
import { mergeMap, EMPTY, of, map, tap } from "rxjs"
import { Encoding } from "../types"
import { createLogger } from "../utils/createLogger"
import { getQuery } from "../utils/getQuery"
import { readdir, readFile, stat, writeFile } from "../utils/rxBindings"

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
		tap((path) => {
			info(`${path} readed`)
		}),
		mergeMap((path) => of(path).pipe(
			stat,
			tap(() => {
				info(`Stat for path "${path}"`)
			}),
			mergeMap((stats) => stats.isFile() ? of(path).pipe(readFile) : EMPTY),
			tap(() => {
				info(`File "${path}" readed`)
			}),
			map((content) => [path, content.replace(from, to)] as [string, string]),
			writeFile,
			tap(() => {
				info(`Changed "${path}" from "${from}" to "${to}"`)
			})
		))
	).subscribe({
		error(error) {
			err(error)
		},
		complete() {
			info('Process ended')
			res.end()
		}
	})
}).listen(8080)

console.log('Server started')
