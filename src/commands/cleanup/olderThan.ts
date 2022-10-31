import { DateTime, Duration } from 'luxon';
import { ArgumentDefinition, Arguments, Command, OptionDefinition, Options } from '../../command';
import { Output } from '../../output';
import { createClient, BackupEnvironment } from '../../dato';
import { DEBUG, CONFIRM } from '../../common/options';
import { FailedToStartCleanup } from '../../errors/misconfigurationErrors';
import { CleanupFailed } from '../../errors/runtimeErrors';

export const name: string = 'older-than';

export const args: ArgumentDefinition[] = [
    {
        name: 'age',
        description: 'An ISO8601 duration string. E.g. "5d", "1w", "P1YT6H", ...',
    },
];

export const options: OptionDefinition[] = [
    DEBUG,
    CONFIRM,
];

type OlderThanArguments = Arguments & {
    age: string
}

export async function handle(args: OlderThanArguments, options: Options, output: Output): Promise<void> {
    const client = createClient();
    const retentionDate = retentionDateFromUnitArgument();
    const format = DateTime.DATETIME_MED_WITH_SECONDS;
    let backups: BackupEnvironment[] = [];

    output.line(`Looking for backups created before ${retentionDate.toLocaleString(format)}...`, '🔎');

    try {
        backups = await client.backups();

        output.debug('Existing backups:', backups);
    } catch (error) {
        throw CleanupFailed.datoApiReturnedWithAnErrorWhileGettingBackupEnvironments(error);
    }

    const backupsOlderThanRetentionDate = backups.filter((backup: BackupEnvironment): boolean => {
        return DateTime.fromISO(backup.meta.created_at) < retentionDate;
    });

    output.debug('Backups older than retention date:', backupsOlderThanRetentionDate);

    if (backupsOlderThanRetentionDate.length === 0) {
        output.completed('Cleanup completed. There were no backups to be deleted.');

        return;
    }

    output.line('The following backups are about to be deleted:', '⚠️')
    backupsOlderThanRetentionDate.forEach((backup: BackupEnvironment) => output.line(backup.id, '>'));

    const shouldDeleteOldBackups = await output.confirm(
        'Are you sure you want to delete all backups listed above?',
    );

    if (! shouldDeleteOldBackups) {
        output.completed('Cleanup canceled.');

        return;
    }

    for await (const backup of backupsOlderThanRetentionDate) {
        await deleteBackup(backup);
    }

    output.completed(`Cleanup completed. ${backupsOlderThanRetentionDate.length} backup(s) were deleted.`);

    function retentionDateFromUnitArgument(): DateTime {
        const isoDuration = `P${args.age}`.toUpperCase().replace('PP', 'P');
        const duration = Duration.fromISO(isoDuration);
        const durationUnits: string[] = Object.keys(duration.toObject());

        if (durationUnits.length === 0) {
            throw FailedToStartCleanup.argumentAgeIsInvalid(args.age);
        }

        const smallestDurationUnit = durationUnits.pop();

        return DateTime.local().startOf(smallestDurationUnit).minus(duration);
    }

    async function deleteBackup(backup: BackupEnvironment): Promise<void> {
        output.line(`Deleting backup '${backup.id}'...`, '>');

        try {
            const response = await client.deleteEnvironmentById(backup.id);

            output.debug('Deleted backup:', response);
        } catch (error) {
            throw CleanupFailed.datoApiReturnedWithAnErrorWhileDeletingBackup(backup, error);
        }
    }
}
