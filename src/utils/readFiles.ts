import { readFile } from "fs"
import { resolve } from "path"
import { Encoding, List } from "../types"

export function readFiles(files: List<string>, callback: (data: string) => void, callbackError: (err: NodeJS.ErrnoException) => void, callbackEnd: () => void) {
	if (files) {
		setTimeout(() => {
			readFile(resolve(process.cwd(), files.item), Encoding.Utf8, (err, data) => {
				if (err) {
					callbackError(err)
					callbackEnd()
				} else {
					callback(data)
					readFiles(files.next, callback, callbackError, callbackEnd)
				}
			})
		}, 2000)
	} else {
		callbackEnd();
	}
}
