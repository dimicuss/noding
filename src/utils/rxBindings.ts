import fs from "fs"
import { resolve } from "path"
import { Observable } from "rxjs"
import { Encoding, ReadFileResult, StatResult, WriteFileArg } from "../types"

export function executeParallel<T>(items: T[], onNext: (list: T, check: () => void) => void, onEnd: () => void) {
	let last = items.length;

	items.forEach((item) => {
		onNext(item, () => {
			last--
			if (last === 0) {
				onEnd()
			}
		})
	})
}

export function readdir(paths: string[], onError?: (error: any) => void) {
	return new Observable<string[]>((subscriber) => {
		executeParallel(paths, (dir, resume) => {
			fs.readdir(dir, (error, names) => {
				if (error) {
					onError?.(error)
					resume()
				} else {
					subscriber.next(names.map((name) => resolve(dir, name)))
					resume()
				}
			})
		}, () => {
			subscriber.complete()
		})
	})
}


export function readFile(paths: string[], onError?: (error: any) => void) {
	return new Observable<ReadFileResult>((subscriber) => {
		executeParallel(paths, (path, resume) => {
			fs.readFile(path, Encoding.Utf8, (error, content) => {
				if (error) {
					onError?.(error)
					resume()
				} else {
					subscriber.next({ path, content })
					resume()
				}
			})
		}, () => {
			subscriber.complete()
		})
	})
}

export function stat(paths: string[], onError?: (error: any) => void) {
	return new Observable<StatResult>((subscriber) => {
		executeParallel(paths, (path, resume) => {
			fs.stat(path, (error, stats) => {
				if (error) {
					onError?.(error)
					resume()
				} else {
					subscriber.next({ path, stats })
					resume()
				}
			})
		}, () => {
			subscriber.complete()
		})
	})
}

export function writeFile(args: WriteFileArg[], onError?: (error: any) => void) {
	return new Observable<string>((subscriber) => {
		executeParallel(args, (arg, resume) => {
			const { path, content } = arg
			fs.writeFile(path, content, (error) => {
				if (error) {
					onError?.(error)
					resume()
				} else {
					subscriber.next(path)
					resume()
				}
			})
		}, () => {
			subscriber.complete()
		})
	})
}

