import fs, { Stats } from "fs"
import { resolve } from "path"
import { Observable, Subscriber } from "rxjs"
import { Encoding } from "../types"
import cp from "child_process";

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

export function createOperator<A, B>(run: (value: A, _: Subscriber<B>, completeTask: () => void) => void) {
	return (o: Observable<A>) => new Observable<B>((_) => {
		const register = createRegister(() => {
			_.complete()
		});

		const sub = o.subscribe({
			next(value) {
				register.addTask((completeTask) => {
					run(value, _, completeTask)
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
			sub.unsubscribe()
		}
	})
}

export const readdir = createOperator<string, string>((path, _, completeTask) => {
	fs.readdir(path, (error, contents) => {
		if (error) {
			_.error(error)
		} else {
			contents.forEach((content) => {
				_.next(resolve(path, content))
			})
		}
		completeTask()
	})
})

export const readFile = createOperator<string, string>((path, _, completeTask) => {
	fs.readFile(path, Encoding.Utf8, (error, content) => {
		if (error) {
			_.error(error)
		} else {
			_.next(content)
		}
		completeTask()
	})
})

export const stat = createOperator<string, Stats>((path, _, completeTask) => {
	fs.stat(path, (error, stats) => {
		if (error) {
			_.error(error)
		} else {
			_.next(stats)
		}
		completeTask()
	})
})

export const writeFile = createOperator<[string, string], string>(([path, content], _, completeTask) => {
	fs.writeFile(path, content, (error) => {
		if (error) {
			_.error(error)
		} else {
			_.next(path)
		}
		completeTask()
	})
})

export const exec = createOperator<string, string>((command, _, completeTask) => {
	const childProcess = cp.exec(command, { encoding: Encoding.Utf8 })
	childProcess.stdin?.end()
	childProcess.stdout?.on('data', (data) => {
		_.next(data)
	})
	childProcess.on('close', () => {
		completeTask()
	})
})

export const createReadStream = createOperator<string, string | Buffer>((path, _, completeTask) => {
	const readStream = fs.createReadStream(path, { encoding: Encoding.Utf8 })
	readStream.on('data', (data) => {
		_.next(data)
	})
	readStream.on('end', () => {
		completeTask()
	})
})
