import { createWriteStream } from "fs"
import { createServer } from "http"
import { mergeMap, EMPTY, of, map, tap, iif } from "rxjs"
import { Encoding } from "../types"
import { createLogger } from "../utils/createLogger"
import { getQuery } from "../utils/getQuery"
import { readdir, readFile, stat, writeFile } from "../utils/rxBindings"

const { info, err } = createLogger(
	createWriteStream('/tmp/files_log', {
		flags: 'a',
		encoding: Encoding.Utf8,
		mode: 0o666
	})
)

createServer((req, res) => {
	const { dir, from, to } = getQuery(req).query

	of(...dir).pipe(
		readdir(),
		tap((path) => {
			info(`${path} readed`)
		}),
		mergeMap((path) => of(path).pipe(
			stat(),
			tap(() => {
				info(`Stat for path "${path}"`)
			}),
			mergeMap((stats) => iif(
				() => stats.isFile(),
				of(path).pipe(readFile()),
				EMPTY
			)),
			tap(() => {
				info(`File "${path}" readed`)
			}),
			map((content) => [path, content.replace(from, to)] as [string, string]),
			writeFile(),
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
