import { S3 } from 'aws-sdk';
import got from 'got';
import { PassThrough } from 'stream';
import { Storage, finished } from '../storage';
import { CannotCreateS3Storage } from '../errors/misconfigurationErrors';

export function createStorage(): Storage {
    const s3: S3 = createS3Client();

    function createS3Client(): S3 {
        const accessKeyId = process.env.DATOCMS_BACKUP_AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.DATOCMS_BACKUP_AWS_ACCESS_KEY_SECRET;

        if (! accessKeyId) {
            throw CannotCreateS3Storage.missingAccessKeyId();
        }

        if (! secretAccessKey) {
            throw CannotCreateS3Storage.missingAccessKeyId();
        }

        return new S3({
            accessKeyId,
            secretAccessKey,
        });
    }

    function resolveBucketAndKeyFromPath(path: string): { Bucket: string, Key: string } {
        const key = path.split('/');
        const bucket = key.shift();

        return {
            Bucket: bucket,
            Key: key.join('/'),
        };
    }

    return {
        async upload(path: string, content: string): Promise<void> {
            const { Bucket, Key } = resolveBucketAndKeyFromPath(path);

            await s3.upload({
                Bucket,
                Key,
                Body: content,
            }).promise();
        },

        async uploadFromUri(path: string, uri: string): Promise<void> {
            const { Bucket, Key } = resolveBucketAndKeyFromPath(path);
            const passThrough = new PassThrough();
            const file = got.stream(uri);

            s3.upload({
                Bucket,
                Key,
                Body: passThrough,
            }).promise();

            return await finished(file, passThrough);
        },
    };
}
