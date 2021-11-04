import { BackupEnvironment, BackupEnvironmentId } from '../dato';

export class RuntimeError extends Error {
    //
}

export class BackupFailed extends RuntimeError {
    static datoApiRespondedWithAnErrorWhileResolvingPrimaryEnvironment(): BackupFailed {
        return new BackupFailed(
            `Backup failed due to an error response from the DatoCMS API while resolving the primary environment.`,
        );
    }

    static datoApiRespondedWithAnErrorWhileCreatingBackup(backupId: BackupEnvironmentId): BackupFailed {
        return new BackupFailed(`Backup "${backupId}" failed due to an error response from the DatoCMS API.`);
    }
}

export class CleanupFailed extends RuntimeError {
    static datoApiReturnedWithAnErrorWhileGettingBackupEnvironments(): CleanupFailed {
        return new CleanupFailed(
            `Cleanup failed due to an error response from the DatoCMS API while getting backup environments.`,
        );
    }

    static datoApiReturnedWithAnErrorWhileDeletingBackup(backup: BackupEnvironment): CleanupFailed {
        return new CleanupFailed(
            `Cleanup failed due to an error response from the DatoCMS API while deleting backup '${backup.id}'.`,
        );
    }
}
