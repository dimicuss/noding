import { createWriteStream } from "fs";
import { createServer } from "http";
import { ContentTypes, Encoding } from "../types";
import { createLogger } from "../utils/createLogger";
import { createReadStream, exec, readdir, stat } from "../utils/rxBindings";
import { map, mergeMap, of, reduce, zip } from "rxjs";
import { resolve } from "path";

const { err } = createLogger(
	createWriteStream('/tmp/static_log', {
		flags: 'a',
		encoding: Encoding.Utf8,
		mode: 0o774
	})
)

createServer((req, res) => {
	const url = resolve(['.', req.url || '/'].join(''))

	of(url).pipe(
		stat,
		mergeMap((stat) =>
			stat.isFile()
				? zip(
					of(`printf $(file -b --mime-type ${url})`).pipe(exec),
					of(url).pipe(createReadStream)
				).pipe(
					map(([type, data]) => ({ type, data }))
				)
				: of(url).pipe(
					readdir,
					reduce((acc, file) => `${acc}${file}\n`, ''),
					map((data) => ({ type: ContentTypes.TextPlain, data }))
				)
		),
	).subscribe({
		next({ type, data }) {
			res.setHeader('Content-type', type)
			res.write(data)
		},
		error(error) {
			err(error)
			res.end()
		},
		complete() {
			res.end();
		}
	})
}).listen(8080)

console.log('Server started')
