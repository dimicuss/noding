export type List<T> = {
	item: T
	next: List<T> | null
} | null

export interface ParsedQuery {
	file: string[]
}

export enum Encoding {
	Utf8 = 'utf8'
}
