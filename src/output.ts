const FG_GREEN = '\x1b[32m';
const FG_RED = '\x1b[31m';
const RESET = '\x1b[0m';

export function line(message: string, icon?: string) {
    console.log([icon, message].filter(value => typeof value === 'string').join(' '));
}

export function completed(message: string): void {
    console.log(FG_GREEN + `✨ ${message}` + RESET);
}

export function error(message: string): void {
    console.error(FG_RED + `🧨 ${message}` + RESET);
}
