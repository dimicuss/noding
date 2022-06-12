import { WriteStream } from "fs";
import { Encoding } from "../types";

export function createLogger(writeStream: WriteStream) {
	return {
		log: (message: string) => {
			const finalMessage = `Log: ${message}`
			console.log(finalMessage)
			writeStream.write(`${finalMessage}\n`, Encoding.Utf8)
		},
		err: (error: any) => {
			if (error instanceof Error) {
				const finalMessage = `Error: ${error.message}`;
				console.log(finalMessage);
				writeStream.write(`${finalMessage}\n`, Encoding.Utf8)
			}
		}
	}
}
