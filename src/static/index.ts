import { createWriteStream } from "fs"
import { createServer } from "http"
import { ContentTypes, Encoding } from "../types"
import { createLogger } from "../utils/createLogger"
import { createReadStream, exec, readdir, stat } from "../utils/rxBindings"
import { map, mergeMap, of, reduce, iif, catchError, tap } from "rxjs"
import { resolve } from "path"
import { getQuery } from "../utils/getQuery"
import { createOnce } from "../utils/createOnce"

const { err } = createLogger(
	createWriteStream('/tmp/static_log', {
		flags: 'a',
		encoding: Encoding.Utf8,
		mode: 0o774
	})
)

createServer((req, res) => {
	const once = createOnce()
	const subscription = of(req).pipe(
		map((req) => resolve(['.', getQuery(req).pathname].join(''))),
		mergeMap((url) => of(url).pipe(
			stat(),
			mergeMap((stat) => iif(
				() => stat.isFile(),
				of(`echo -n $(file -b -L --mime-type ${url})`).pipe(
					exec(),
					mergeMap((type) => of(url).pipe(
						createReadStream(),
						map((data) => ({
							type,
							data,
							code: 200,
						}))
					)),
				),
				of(url).pipe(
					readdir(),
					reduce((acc, file) => `${acc}${file}\n`, ''),
					map((data) => ({
						type: ContentTypes.TextPlain,
						data,
						code: 200,
					}))
				)
			)))
		),
		catchError((error) => {
			err(error)
			return of({
				type: ContentTypes.TextPlain,
				data: 'Bad request',
				code: 503,
			})
		}),
		tap({
			next: ({ type, data, code }) => {
				once(() => {
					res.setHeader('Content-type', type)
					res.statusCode = code
				})
				res.write(data)
			},
			complete: () => {
				res.end()
			}
		}),
	).subscribe()

	req.on('close', () => {
		subscription.unsubscribe()
	})
}).listen(8080)

console.log('Server started')
