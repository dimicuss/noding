import { IncomingMessage } from 'http';
import { defaultString } from "./defaults";

export function getQuery(req: IncomingMessage) {
	const url = new URL(defaultString(req.url), `http://${req.headers.host}`);
	const search = new URLSearchParams(url.searchParams);

	return {
		dir: search.getAll('dir').filter((item) => item !== ''),
		from: search.getAll('from').join(),
		to: search.getAll('to').join()
	}
}
