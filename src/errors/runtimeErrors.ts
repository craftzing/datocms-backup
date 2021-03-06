import { BackupEnvironment, BackupEnvironmentId } from '../dato';

export class RuntimeError extends Error {
    constructor(message: string, public originalError: Error) {
        super(message);
    }
}

export class BackupFailed extends RuntimeError {
    static datoApiRespondedWithAnErrorWhileResolvingPrimaryEnvironment(originalError: Error): BackupFailed {
        return new BackupFailed(
            `Backup failed due to an error response from the DatoCMS API while resolving the primary environment.`,
            originalError,
        );
    }

    static datoApiRespondedWithAnErrorWhileCreatingBackup(
        backupId: BackupEnvironmentId,
        originalError: Error
    ): BackupFailed {
        return new BackupFailed(
            `Backup "${backupId}" failed due to an error response from the DatoCMS API.`,
            originalError,
        );
    }
}

export class CleanupFailed extends RuntimeError {
    static datoApiReturnedWithAnErrorWhileGettingBackupEnvironments(originalError: Error): CleanupFailed {
        return new CleanupFailed(
            `Cleanup failed due to an error response from the DatoCMS API while getting backup environments.`,
            originalError,
        );
    }

    static datoApiReturnedWithAnErrorWhileDeletingBackup(
        backup: BackupEnvironment,
        originalError: Error
    ): CleanupFailed {
        return new CleanupFailed(
            `Cleanup failed due to an error response from the DatoCMS API while deleting backup '${backup.id}'.`,
            originalError,
        );
    }
}

export class DumpFailed extends RuntimeError {
    static datoApiRespondedWithAnErrorWhileGettingDataDump(originalError: Error): DumpFailed {
        return new DumpFailed(
            `Dump failed due to an error response from the DatoCMS API while getting the data dump.`,
            originalError,
        );
    }

    static storageApiRespondedWithAnErrorWhileUploadingData(originalError: Error): DumpFailed {
        return new DumpFailed(
            `Dump failed due to an error response from the storage API while uploading data.`,
            originalError,
        );
    }

    static errorWhileDownloadingAsset(assetURI: string, originalError: Error): DumpFailed {
        return new DumpFailed(
            `Dump failed due to an error while downloading asset "${assetURI}".`,
            originalError,
        );
    }

    static errorWhileUploadingAsset(assetPath: string, originalError: Error): DumpFailed {
        return new DumpFailed(
            `Dump failed due to an error while uploading asset "${assetPath}".`,
            originalError,
        );
    }
}
