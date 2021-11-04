export class Misconfiguration extends Error {
    //
}

export class CannotInitialiseDatoClient extends Misconfiguration {
    static missingApiToken(): CannotInitialiseDatoClient {
        return new CannotInitialiseDatoClient(
            'Please make sure to provide a valid DatoCMS API token by setting ' +
            'a DATOCMS_BACKUP_API_TOKEN environment variable.',
        );
    }
}
