import https from 'http';
import { } from './types'

console.log(https);

function createTimer() {
	let timerId: NodeJS.Timeout;

	function clear() {
		clearTimeout(timerId);
	}

	function startTimer(callback: () => void, timeout: number) {
		callback()
		setTimeout(() => {
			startTimer(callback, timeout);
		}, timeout)
	}

	return {
		clear,
		startTimer,
	}
}

let leftCounts = 10;
const timer = createTimer();

timer.startTimer(() => {
	console.log(leftCounts)
	if (leftCounts) {
		--leftCounts;
	} else {
		timer.clear();
		process.exit();
	}
}, 1000)
