import { Output } from './output';

export const output: Output = {
    completed: jest.fn((message: string): void => {}),

    confirm(question: string): Promise<boolean> {
        return Promise.resolve(false);
    },

    debug: jest.fn((data: any): void => {}),
    error: jest.fn((message: string): void => {}),
    help: jest.fn((): void => {}),

    line(message: string, icon: string | undefined): void {
    },

    misconfig(message: string): void {
    },
};
