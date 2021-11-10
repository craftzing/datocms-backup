export class MisconfigurationError extends Error {
    //
}

export class CannotCreateDatoClient extends MisconfigurationError {
    static missingApiToken(): CannotCreateDatoClient {
        return new CannotCreateDatoClient(
            'Please make sure to provide a valid DatoCMS API token by setting ' +
            'a DATOCMS_BACKUP_API_TOKEN environment variable.',
        );
    }
}

export class CannotCreateS3Storage extends MisconfigurationError {
    static missingAccessKeyId(): CannotCreateS3Storage {
        return new CannotCreateS3Storage(
            'To use the S3 storage, please provide a DATOCMS_BACKUP_AWS_ACCESS_KEY_ID environment variable.',
        );
    }

    static missingAccessKeySecret(): CannotCreateS3Storage {
        return new CannotCreateS3Storage(
            'To use the S3 storage, please provide a DATOCMS_BACKUP_AWS_ACCESS_KEY_SECRET environment variable.',
        );
    }
}

export class FailedToStartCleanup extends MisconfigurationError {
    static argumentAgeIsInvalid(age: string): FailedToStartCleanup {
        return new FailedToStartCleanup(
            `Argument "age" must be a valid ISO8601 duration string (e.g. "5d", "1w", "P1YT6H", ...). Got "${age}".`,
        );
    }
}
