import { S3 } from 'aws-sdk';
import { Storage } from '../storage';
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

    return {
        async upload(path: string, content: string): Promise<void> {
            const key = path.split('/');
            const bucket = key.shift();

            await s3.upload({
                Bucket: bucket,
                Key: key.join('/'),
                Body: content,
            }).promise();
        },
    };
}
