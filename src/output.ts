import { prompt } from 'inquirer';

const FG_GREEN = '\x1b[32m';
const FG_MAGENTA = '\x1b[35m';
const FG_RED = '\x1b[31m';
const RESET = '\x1b[0m';

export type Output = {
    misconfig: (message: string) => void
    line: (message: string, icon?: string) => void
    confirm: (question: string) => Promise<boolean>
    completed: (message: string) => void
    error: (message: string) => void
    debug: (...data: any[]) => void
}

export type OutputOptions = {
    debug?: boolean
}

export function createOutput(options: OutputOptions): Output {
    return {
        misconfig(message: string): void {
            console.log(`error: ${message}`);
            process.exit(1);
        },

        line(message: string, icon?: string): void {
            console.log([icon, message].filter(value => typeof value === 'string').join(' '));
        },

        async confirm(question: string): Promise<boolean> {
            const { answer } = await prompt({
                type: 'confirm',
                name: 'answer',
                message: question,
            });

            return answer;
        },

        completed(message: string): void {
            console.log(FG_GREEN + `✨ ${message}` + RESET);
            process.exit(0);
        },

        error(message: string): void {
            console.error(FG_RED + `🧨 ${message}` + RESET);
            process.exit(1);
        },

        debug(...data: any[]): void {
            if (! options.debug) {
                return;
            }

            console.log(FG_MAGENTA + '[debug]' + RESET, ...data);
        },
    };
}

