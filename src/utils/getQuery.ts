import { IncomingMessage } from 'http';
import { Protocols } from '../types';
import { defaultString } from "./defaults";

export function getQuery(req: IncomingMessage, protocol: Protocols = Protocols.Http) {
	const url = new URL(defaultString(req.url), `${protocol}://${req.headers.host}`);
	const search = new URLSearchParams(url.searchParams);

	return {
		dir: search.getAll('dir').filter((item) => item !== ''),
		from: search.getAll('from').join(),
		to: search.getAll('to').join()
	}
}
