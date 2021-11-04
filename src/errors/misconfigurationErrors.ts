export class MisconfigurationError extends Error {
    //
}

export class CannotInitialiseDatoClient extends MisconfigurationError {
    static missingApiToken(): CannotInitialiseDatoClient {
        return new CannotInitialiseDatoClient(
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
