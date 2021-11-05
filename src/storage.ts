import * as S3 from './storage/s3';

export enum Driver {
    S3 = 's3'
}

export type Storage = {
    upload: (path: string, content: string) => Promise<void>
}

export function createStorage(driver: Driver): Storage {
    return {
        [Driver.S3]: S3.createStorage,
    }[driver]();
}
