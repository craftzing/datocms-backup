import { Storage } from './storage';

export let errors: {
    [name: string]: Error | undefined
} = {};

beforeEach(() => {
    jest.clearAllMocks();
    errors = {
        upload: undefined,
    };
});

export function fakeErrorWhileUploadingToStorage(): void {
    errors.dataDump = new Error('Faked an error while uploading to storage.');
}

export const storage: Storage = {
    upload: jest.fn(async (path: string, content: string): Promise<void> => {
        if (errors.upload) {
            throw errors.upload;
        }

        return Promise.resolve();
    }),
}
