export function createConsoleSpy() {
    let stdout: string = '';
    let errorMessage: string = '';

    return {
        errorMessage: (): string => errorMessage,
        hasError: (message: string): boolean => errorMessage === message,
        error: (message: string): void => {
            errorMessage = message;
        },

        stdout: (): string => stdout,
        hasWrittenMessageToStdout: (message: string): boolean => stdout.includes(message),
        log: (...messages: string[]): void => {
            stdout += `${messages.join(' ')}\n`;
        },
    };
}
