export function createTimer(timeout: number) {
	let timerId: NodeJS.Timeout

	function clear() {
		clearTimeout(timerId)
	}


	function startTimer<V>(callback: (start: (v: V) => void, v: V) => void, v: V) {
		function start(v: V) {
			timerId = setTimeout(() => {
				startTimer(callback, v)
			}, timeout)
		}

		callback(start, v)
	}

	return {
		clear,
		startTimer,
	}
}
