import fs from "fs"

export type List<T> = {
	item: T
	next: List<T> | null
} | null

export enum Encoding {
	Utf8 = 'utf8',
}

export interface StatResult {
	path: fs.PathLike
	stats: fs.Stats
}

export interface WriteFileArg {
	path: fs.PathLike
	content: string
}

export interface ReadFileResult {
	path: fs.PathLike
	content: string
}
