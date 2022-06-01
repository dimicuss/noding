import { List } from '../types';

export function createList<Item>(list: Item[]): List<Item> {
	const item = list[0];

	return item
		? {
			item,
			next: createList(list.slice(1)),
		}
		: null
}

export function createMessage(message: string) {
	return {
		print: () => {
			console.log(message)
		}
	}
}
