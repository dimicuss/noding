import { WriteStream } from "fs";
import { Encoding } from "../types";

export function createLogger(writeStream: WriteStream) {
	return {
		info: (message: string) => {
			const finalMessage = `${Date.now()} Info: ${message}\n`
			process.stdout.write(finalMessage)
			writeStream.write(finalMessage, Encoding.Utf8)
		},
		err: (error: any) => {
			if (error instanceof Error) {
				const finalMessage = `${Date.now()} Error: ${error.message}\n`
				process.stdout.write(finalMessage)
				writeStream.write(finalMessage, Encoding.Utf8)
			}
		}
	}
}
