import { parse as qsParse } from "querystring";
import { ParsedQuery } from "../types";
import { defaultString } from "./defaults";

function toArray<T>(value: T | T[]) {
	return value instanceof Array
		? value
		: value !== null && value !== undefined ? [value] : []
}

export function parse(query: string): ParsedQuery {
	const parsedQuery = qsParse(query.replace(/^\/\?/, ''));

	return {
		file: toArray(parsedQuery.file).map(defaultString)
	}
}
