import { Output } from './output';

let shouldConfirm = false;

export function fakeConfirmation(): void {
    shouldConfirm = true;
}

export const output: Output = {
    completed: jest.fn((message: string): void => {}),

    confirm: jest.fn((question: string): Promise<boolean> => {
        return Promise.resolve(shouldConfirm);
    }),

    debug: jest.fn((data: any): void => {}),
    error: jest.fn((message: string): void => {}),
    warn: jest.fn((message: string): void => {}),
    help: jest.fn((): void => {}),

    line(message: string, icon: string | undefined): void {},

    misconfig: jest.fn((message: string): void => {}),
};
