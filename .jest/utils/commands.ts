import { spawn } from 'child_process';

type CommandResult = {
    exitCode: number
    output?: string
    errorOutput?: string
}

export async function runCommand(command: string, ...args: string[]): Promise<CommandResult> {
    const process = spawn('node', [command, ...args]);
    const chunks = [];
    const errorChunks = [];

    process.stdout.on('data', (chunk) => {
        chunks.push(chunk);
    });

    process.stderr.on('data', (chunk) => {
        errorChunks.push(chunk);
    });

    const [exitCode, output, errorOutput]: [number, string, string] = await Promise.all([
        new Promise<number>((resolve) => {
            process.on('exit', (exitCode: number) => resolve(exitCode));
        }),
        new Promise<string>((resolve) => {
            process.stdout.on('end', () => resolve(Buffer.concat(chunks).toString()));
        }),
        new Promise<string>((resolve) => {
            process.stderr.on('end', () => resolve(Buffer.concat(errorChunks).toString()));
        }),
    ]);

    return {
        exitCode,
        output,
        errorOutput,
    };
}
