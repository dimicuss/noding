import cp from "child_process";
import fs, { Stats } from "fs"
import { resolve } from "path"
import { Observable } from "rxjs"
import { Encoding } from "../types"

interface RegisterSubscriber<T> {
	complete: () => void;
	next: (item: T) => void;
	error: (error: unknown) => void;
}

export function createRegister(onEnd: () => void) {
	let completed = false;
	let tasks: ((completeTask: () => void) => void)[] = []

	return {
		addTask: (task: (completeTask: () => void) => void) => {
			tasks.push(task)
			task(() => {
				tasks = tasks.filter((taskToRemove) => taskToRemove !== task)
				if (completed && tasks.length === 0) {
					onEnd()
				}
			})
		},
		complete: () => {
			if (tasks.length > 0) {
				completed = true
			} else {
				onEnd();
			}
		}
	}
}

export function createOperator<A, B>(runTask: (value: A, registerSubscriber: RegisterSubscriber<B>) => (() => void) | void) {
	return (o: Observable<A>) => new Observable<B>((_) => {
		let tasksToDrop: ((() => void) | void)[] = [];

		const register = createRegister(() => {
			_.complete()
		});

		const subscription = o.subscribe({
			next(value) {
				register.addTask((completeTask) => {
					tasksToDrop.push(
						runTask(value, {
							next: (item: B) => _.next(item),
							error: (error: unknown) => _.error(error),
							complete: () => completeTask()
						})
					)
				})
			},
			error(error) {
				_.error(error)
			},
			complete() {
				register.complete()
			}
		})

		return () => {
			tasksToDrop.forEach((drop) => {
				drop?.()
			});
			subscription.unsubscribe()
		}
	})
}

export const readdir = () => createOperator<string, string>((path, s) => {
	fs.readdir(path, (error, contents) => {
		if (error) {
			s.error(error)
		} else {
			contents.forEach((content) => {
				s.next(resolve(path, content))
			})
		}
		s.complete()
	})
})

export const readFile = () => createOperator<string, string>((path, s) => {
	fs.readFile(path, Encoding.Utf8, (error, content) => {
		if (error) {
			s.error(error)
		} else {
			s.next(content)
		}
		s.complete()
	})
})

export const stat = () => createOperator<string, Stats>((path, s) => {
	fs.stat(path, (error, stats) => {
		if (error) {
			s.error(error)
		} else {
			s.next(stats)
		}
		s.complete()
	})
})

export const writeFile = () => createOperator<[string, string], string>(([path, content], s) => {
	fs.writeFile(path, content, (error) => {
		if (error) {
			s.error(error)
		} else {
			s.next(path)
		}
		s.complete()
	})
})

export const exec = () => createOperator<string, string>((command, s) => {
	const childProcess = cp.exec(command)
	childProcess.stdin?.end()
	childProcess.stdout?.on('data', (data) => {
		s.next(data)
	})
	childProcess.stderr?.once('data', () => {
		s.error(new Error(command))
	})
	childProcess.stdout?.on('end', () => {
		s.complete()
	})
	childProcess.on('error', (error) => {
		s.error(error)
	})
	return () => {
		childProcess.kill()
	}
})

export const createReadStream = () => createOperator<string, string | Buffer>((path, s) => {
	const readStream = fs.createReadStream(path)
	readStream.on('data', (data) => {
		s.next(data)
	})
	readStream.on('error', (error) => {
		s.error(error)
	})
	readStream.on('end', () => {
		s.complete()
	})
	return () => {
		readStream.destroy()
	}
})
