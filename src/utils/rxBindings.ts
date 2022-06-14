import fs from "fs"
import { resolve } from "path"
import { merge, Observable } from "rxjs"
import { Encoding, ReadFileResult, Result, StatResult, WriteFileArg } from "../types"

export function createError<T>(error: any): Result<T> {
	return { error }
}

export function createResult<T>(result: T): Result<T> {
	return { result }
}

export function readdir(...paths: string[]) {
	const observables = paths.map((path) => {
		return new Observable<Result<string[]>>((subscriber) => {
			fs.readdir(path, (error, names) => {
				if (error) {
					subscriber.next(createError(error))
				} else {
					subscriber.next(createResult(names.map((name) => resolve(path, name))))
				}
				subscriber.complete()
			})
		})
	})


	return merge(...observables)
}

export function readFile(...paths: string[]) {
	const observables = paths.map((path) => {
		return new Observable<Result<ReadFileResult>>((subscriber) => {
			fs.readFile(path, Encoding.Utf8, (error, content) => {
				if (error) {
					subscriber.next(createError(error))
				} else {
					subscriber.next(createResult({ path, content }))
				}
				subscriber.complete()
			})
		})
	});

	return merge(...observables)
}

export function stat(...paths: string[]) {
	const observables = paths.map((path) => {
		return new Observable<Result<StatResult>>((subscriber) => {
			fs.stat(path, (error, stats) => {
				if (error) {
					subscriber.next(createError(error))
				} else {
					subscriber.next(createResult({ path, stats }))
				}
				subscriber.complete()
			})
		})
	})

	return merge(...observables)
}

export function writeFile(...args: WriteFileArg[]) {
	const observables = args.map((arg) => {
		const { path, content } = arg
		return new Observable<Result<string>>((subscriber) => {
			fs.writeFile(path, content, (error) => {
				if (error) {
					subscriber.next(createError(error))
				} else {
					subscriber.next(createResult(path))
				}
				subscriber.complete()
			})
		});
	});

	return merge(...observables)
}

export function suppres<T>(handleError: (error: any) => void) {
	return (observable: Observable<Result<T>>) => {
		return new Observable<T>((subscriber) => {
			observable.subscribe({
				next({ error, result }) {
					if (error) {
						handleError(error)
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
