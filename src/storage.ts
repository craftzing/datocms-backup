import { pipeline, PipelineDestination, PipelineSource } from 'stream';
import { promisify } from 'util';
import * as S3 from './storage/s3';

export enum Driver {
    S3 = 's3'
}

export type Storage = {
    upload(path: string, content: string): Promise<void>
    uploadFromUri(path: string, uri: string): Promise<void>
}

export function finished(src: PipelineSource<any>, dest: PipelineDestination<any, any>): Promise<void> {
    return promisify(pipeline)(src, dest);
}

export function createStorage(driver: Driver): Storage {
    return {
        [Driver.S3]: S3.createStorage,
    }[driver]();
}
