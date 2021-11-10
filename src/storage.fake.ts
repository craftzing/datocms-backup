import { Driver, Storage } from './storage';

export let usedDriver: Driver = undefined;
export let errors: {
    [name: string]: Error | undefined
} = {};

export function reset(): void {
    usedDriver = undefined;
    errors = {
        upload: undefined,
    };
}

export function createWithDriver(driver: Driver): Storage {
    usedDriver = driver;

    return storage;
}

export function throwErrorWhileUploadingToStorage(): void {
    errors.dataDump = new Error('Faked an error while uploading to storage.');
}

export const storage: Storage = {
    upload: jest.fn(async (path: string, content: string): Promise<void> => {
        if (errors.upload) {
            throw errors.upload;
        }

        return Promise.resolve();
    }),

    uploadFromUri: jest.fn(async (path: string, uri: string): Promise<void> => {
        return Promise.resolve();
    }),
}
