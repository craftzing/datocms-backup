import { createConsoleSpy } from '../utils/console.fake';

class ExitCode extends Error {
    constructor(code?: number) {
        super(`Exit code: ${code}`);
    }
}

declare global {
    namespace jest {
        interface Matchers<R> {
            toWriteToStdOut(message: string): R;
            toWriteToStdErr(message: string): R;
            toExitWithCode(code: number): R;
        }
    }
}

expect.extend({
    async toWriteToStdOut(received: Function, message: string): Promise<jest.CustomMatcherResult> {
        const consoleSpy = createConsoleSpy();
        jest.spyOn(console, 'log').mockImplementation(consoleSpy.log);
        jest.spyOn(process, 'exit').mockImplementation();

        await received();

        return {
            message: () =>
                `Expected message "${message}" to be written to stdout, but received: \n"${consoleSpy.stdout()}"`
            ,
            pass: consoleSpy.hasWrittenMessageToStdout(message),
        };
    },

    async toWriteToStdErr(received: Function, message: string): Promise<jest.CustomMatcherResult> {
        const consoleSpy = createConsoleSpy();
        jest.spyOn(console, 'error').mockImplementation(consoleSpy.error);
        jest.spyOn(process, 'exit').mockImplementation();

        await received();

        return {
            message: () =>
                `Expected message "${message}" to be written to stderr, but received "${consoleSpy.errorMessage()}"`
            ,
            pass: consoleSpy.hasError(message),
        };
    },

    async toExitWithCode(received: Function, expected: number): Promise<jest.CustomMatcherResult> {
        let actual: number;
        jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
            actual = code;
            throw new ExitCode(code);
        });

        try {
            await received();
        } catch (e) {
            if (! (e instanceof ExitCode)) {
                throw e;
            }
        }

        return {
            message: () => `The process was expected to exit with code ${expected}, received ${actual}.`,
            pass: actual === expected,
        };
    }
});
