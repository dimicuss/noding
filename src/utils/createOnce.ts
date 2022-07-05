export function createOnce() {
	let called = false;
	return (fn: () => void) => {
		if (!called) {
			called = true;
			fn();
		}
	}
}
