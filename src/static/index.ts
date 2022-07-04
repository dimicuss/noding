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
	const once = createOnce();
	
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
						map((data) => ({ type, data }))
					)),
				),
				of(url).pipe(
					readdir(),
					reduce((acc, file) => `${acc}${file}\n`, ''),
					map((data) => ({ type: ContentTypes.TextPlain, data }))
				)
			)))
		),
		catchError((error) => {
			err(error)
			return of({ type: ContentTypes.TextPlain, data: 'Bad request' })
		})
	).subscribe({
		next({ type, data }) {
			once(() => {
				res.setHeader('Content-type', type)
				res.statusCode = 200
			})
			res.write(data)
		},
		complete() {
			res.end();
		}
	})
	
	req.once('close', () => {
		subscription.unsubscribe()
	})
}).listen(8080)

console.log('Server started')
