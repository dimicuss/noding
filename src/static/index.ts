import { createWriteStream } from "fs";
import { createServer } from "http";
import { Encoding } from "../types";
import { createLogger } from "../utils/createLogger";
import { side, stat, suppres } from "../utils/rxBindings";

const { info, err } = createLogger(
	createWriteStream('/tmp/static_log', {
		flags: 'a',
		encoding: Encoding.Utf8,
		mode: 0o774
	})
)

createServer((req, res) => {
	const { url } = req

	stat(url).pipe(
		suppres((error) => {
			err(error)
		}),
		side(({ path }) => {
			info(`Stat for ${path}`)
		}),
		//  Записать в выходной поток
	).subscribe({
		complete() {
			res.end();
			info('Process complete')
		}
	})
}).listen(8080)

console.log('Server started')
