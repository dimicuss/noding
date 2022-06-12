import fs from "fs"

export type ActualList<T> = {
	item: T
	list: T[]
	next: List<T> | null
}

export type List<T> = ActualList<T> | null

export enum Encoding {
	Utf8 = 'utf8',
}

export interface StatResult {
	path: string
	stats: fs.Stats
}

export interface WriteFileArg {
	path: string
	content: string
}

export interface ReadFileResult {
	path: string
	content: string
}
