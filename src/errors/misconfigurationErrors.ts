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

export class FailedToStartCleanup extends MisconfigurationError {
    static argumentAgeIsInvalid(age: string): FailedToStartCleanup {
        return new FailedToStartCleanup(
            `Argument "age" must be a valid ISO8601 duration string (e.g. "5d", "1w", "P1YT6H", ...). Got "${age}".`,
        );
    }
}
