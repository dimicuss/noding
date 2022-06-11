import fs from "fs"
import { resolve } from "path"
import { merge, Observable } from "rxjs"
import { Encoding, ReadFileResult, StatResult, WriteFileArg } from "../types"

export function readdir(...paths: string[]) {
	return merge(...paths.map((path) => new Observable<string[]>((subscriber) => {
		fs.readdir(path, (err, contents) => {
			if (err) {
				subscriber.complete()
			} else {
				subscriber.next(
					contents.map((content) => resolve(path, content))
				)
				subscriber.complete()
			}
		})
	})))
}


export function readFile(...paths: fs.PathLike[]) {
	return merge(...paths.map((path) => new Observable<ReadFileResult>((subscriber) => {
		fs.readFile(path, Encoding.Utf8, (err, content) => {
			if (err) {
				subscriber.complete()
			} else {
				subscriber.next({ path, content })
				subscriber.complete()
			}
		})
	})))
}

export function stat(...paths: fs.PathLike[]) {
	return merge(...paths.map((path) => new Observable<StatResult>((subscriber) => {
		fs.stat(path, (err, stats) => {
			if (err) {
				subscriber.complete()
			} else {
				subscriber.next({ path, stats })
				subscriber.complete()
			}
		})
	})))
}

export function writeFile(...args: WriteFileArg[]) {
	return merge(...args.map(({ path, content }) => new Observable<fs.PathLike>((subscriber) => {
		fs.writeFile(path, content, (err) => {
			if (err) {
				subscriber.complete()
			} else {
				subscriber.next(path)
				subscriber.complete()
			}
		})
	})))
}
