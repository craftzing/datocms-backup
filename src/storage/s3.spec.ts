import { Storage } from '../storage';
import { S3 } from '../aws.fake';
import { createStorage } from './s3';
import { CannotCreateS3Storage } from '../errors/misconfigurationErrors';

const DATOCMS_BACKUP_AWS_ACCESS_KEY_ID = 'some-fake-access-key-id';
const DATOCMS_BACKUP_AWS_ACCESS_KEY_SECRET = 'some-fake-access-key-secret';

jest.mock('aws-sdk', () => ({
    S3: jest.fn(() => S3),
}));

describe('s3 storage', () => {
    beforeEach(() => {
        process.env = {
            DATOCMS_BACKUP_AWS_ACCESS_KEY_ID,
            DATOCMS_BACKUP_AWS_ACCESS_KEY_SECRET,
        };
    });

    it('fails to create when the DATOCMS_BACKUP_AWS_ACCESS_KEY_ID env var is missing', async () => {
        process.env = {
            DATOCMS_BACKUP_AWS_ACCESS_KEY_SECRET,
        };

        try {
            createStorage();
        } catch (error) {
            expect(error).toBeInstanceOf(CannotCreateS3Storage);
        }
    });

    it('fails to create when the DATOCMS_BACKUP_AWS_ACCESS_KEY_SECRET env var is missing', async () => {
        process.env = {
            DATOCMS_BACKUP_AWS_ACCESS_KEY_ID,
        };

        try {
            createStorage();
        } catch (error) {
            expect(error).toBeInstanceOf(CannotCreateS3Storage);
        }
    });

    it('can upload to S3', async () => {
        const storage: Storage = createStorage();
        const path: string = 'bucket/path/to/file.json';
        const content: string = 'Some content';

        await storage.upload(path, content);

        expect(S3.upload).toHaveBeenCalledTimes(1);
        expect(S3.upload).toHaveBeenCalledWith({
            Bucket: 'bucket',
            Key: 'path/to/file.json',
            Body: content,
        });
    });
});
