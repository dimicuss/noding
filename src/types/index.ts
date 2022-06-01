export type List<T> = {
	item: T;
	next: List<T> | null;
} | null
