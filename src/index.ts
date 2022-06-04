import { createList, createMessage } from './utils/createList';
import { createTimer } from './utils/createTimer';

const messages = [
	['Timer in'],
	[1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12],
	["Timer out"],
]
	.flat()
	.map(message => createMessage<number | string>(message))

const timer = createTimer(1000)

timer.startTimer((start, messagesList) => {
	messagesList?.item.print();
	if (messagesList?.next) {
		start(messagesList.next)
	}
}, createList(messages))
