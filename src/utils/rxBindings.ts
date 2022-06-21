import fs, { Stats } from "fs"
import { resolve } from "path"
import { merge, Observable } from "rxjs"
import { Encoding, ReadFileResult, Result, StatResult, WriteFileArg } from "../types"

export function createError<T>(error: any): Result<T> {
	return { error }
}

export function createResult<T>(result: T): Result<T> {
	return { result }
}

export function createRegister(onEnd: () => void) {
	let completed = false;
	let tasks: ((completeTask: () => void) => void)[] = []

	return {
		addTask: (task: (completeTask: () => void) => void) => {
			if (!completed) {
				tasks.push(task)
				task(() => {
					tasks = tasks.filter((taskToRemove) => taskToRemove !== task)
					if (completed && tasks.length === 0) {
						onEnd()
					}
				})
			}
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

export function readdir(o: Observable<string>) {
	return new Observable<Result<string>>((_) => {
		const register = createRegister(() => {
			_.complete()
		})
		const s = o.subscribe({
			next(dir) {
				register.addTask((completeTask) => {
					fs.readdir(dir, (error, contents) => {
						if (error) {
							_.next(createError(error))
						} else {
							contents.forEach((content) => {
								_.next(createResult(resolve(dir, content)))
							})
						}
						completeTask()
					})
				})
			},
			error(error) {
				_.error(error)
			},
			complete() {
				register.complete()
			}
		});

		return () => {
			s.unsubscribe()
		}
	});
}

export function readFile(o: Observable<string>) {
	return new Observable<Result<string>>((_) => {
		const register = createRegister(() => {
			_.complete()
		})
		const s = o.subscribe({
			next(path) {
				register.addTask((completeTask) => {
					fs.readFile(path, Encoding.Utf8, (error, content) => {
						if (error) {
							_.next(createError(error))
						} else {
							_.next(createResult(content))
						}
						completeTask()
					})
				})
			},
			error(error) {
				_.error(error)
			},
			complete() {
				register.complete()
			}
		});

		return () => {
			s.unsubscribe()
		}
	});
}

export function stat(o: Observable<string>) {
	return new Observable<Result<Stats>>((_) => {
		const register = createRegister(() => {
			_.complete()
		})
		const s = o.subscribe({
			next(file) {
				register.addTask((completeTask) => {
					fs.stat(file, (error, stats) => {
						if (error) {
							_.next(createError(error))
						} else {
							_.next(createResult(stats))
						}
						completeTask()
					})
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
			s.unsubscribe()
		}
	});
}

export function writeFile(o: Observable<WriteFileArg>) {
	return new Observable<Result<string>>((_) => {
		const register = createRegister(() => {
			_.complete()
		})
		const s = o.subscribe({
			next({ path, content }) {
				register.addTask((completeTask) => {
					fs.writeFile(path, content, (error) => {
						if (error) {
							_.next(createError(error))
						} else {
							_.next(createResult(path))
						}
						completeTask()
					})
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
			s.unsubscribe()
		}
	});
}

export function suppres<T>(handleError?: (error: any) => void) {
	return (observable: Observable<Result<T>>) => {
		return new Observable<T>((subscriber) => {
			observable.subscribe({
				next({ error, result }) {
					if (error) {
						handleError?.(error)
					} else if (result) {
						subscriber.next(result)
					}
				},
				error(error) {
					subscriber.error(error)
				},
				complete() {
					subscriber.complete()
				}
			})
		})
	}
}

export function side<T>(sideEffect: (item: T) => void) {
	return (observable: Observable<T>) => {
		return new Observable<T>((subscriber) => {
			observable.subscribe({
				next(item) {
					sideEffect(item)
					subscriber.next(item)
				},
				error(error) {
					subscriber.error(error)
				},
				complete() {
					subscriber.complete()
				}
			})
		})
	}
}
