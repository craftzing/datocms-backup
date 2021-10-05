const FG_GREEN = '\x1b[32m';
const FG_MAGENTA = '\x1b[35m';
const FG_RED = '\x1b[31m';
const RESET = '\x1b[0m';

export type Output = {
    line: (message: string, icon?: string) => void
    completed: (message: string) => void
    error: (message: string) => void
    debug: (data: any) => void
}

export type OutputOptions = {
    debug?: boolean
}

export function createOutput(options: OutputOptions): Output {
    function line(message: string, icon?: string) {
        console.log([icon, message].filter(value => typeof value === 'string').join(' '));
    }

    function completed(message: string): void {
        console.log(FG_GREEN + `✨ ${message}` + RESET);
        process.exit(0);
    }

    function error(message: string): void {
        console.error(FG_RED + `🧨 ${message}` + RESET);
        process.exit(1);
    }

    function debug(data: any): void {
        if (! options.debug) {
            return;
        }

        console.log(FG_MAGENTA + '[debug]' + RESET, data);
    }

    return {
        line,
        completed,
        error,
        debug,
    };
}

