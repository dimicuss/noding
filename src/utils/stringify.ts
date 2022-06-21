export function stringify(obj: unknown) {
	const walkedValues: unknown[] = [];

	return JSON.stringify(obj, (_, value) => {
		if (value instanceof Object) {
			if (walkedValues.includes(value)) {
				return `*** Circular ***`
			} else {
				walkedValues.push(value)
				return value
			}
		}

		return value
	}, 4)
}
