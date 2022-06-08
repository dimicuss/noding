import { spawn } from "child_process";

const list = spawn('ls', ['-Al', '/']);
const grep = spawn('grep', ['rwx']);

list.stdout.on('data', (data) => {
	grep.stdin.write(data);
	console.log(`ls: ${data}`);
});

grep.stdout.on('data', (data) => {
	console.log(`grep: ${data}`);
});

list.stderr.on('data', (error) => {
	console.log(`ls error: ${error}`);
});

grep.stderr.on('data', (error) => {
	console.log(`grep error: ${error}`);
});

list.on('close', () => {
	console.log('ls: closed');
	// grep.stdin.end();
});

grep.on('close', () => {
	console.log('grep: closed')
	process.exit();
});

