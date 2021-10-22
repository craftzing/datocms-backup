import { DateTime, Duration } from 'luxon';
import { Arguments, Command, Options } from '../../command';
import { Output } from '../../output';
import { createClient, BackupEnvironment } from '../../dato';
import { DEBUG } from '../../common/options';

export const COMMAND: Command = {
    name: 'older-than',
    arguments: [
        {
            name: 'age',
            description: 'An ISO8601 duration string. E.g. "5d", "1w", "P1YT6H", ...',
        },
    ],
    options: [
        DEBUG,
    ],
    handle,
}

type OlderThanArguments = Arguments & {
    age: string
}

async function handle(args: OlderThanArguments, options: Options, output: Output): Promise<void> {
    const client = createClient();
    const retentionDate = retentionDateFromUnitArgument();
    const format = DateTime.DATETIME_MED_WITH_SECONDS;
    let backups: BackupEnvironment[] = [];

    output.line(`Looking for backups created before ${retentionDate.toLocaleString(format)}...`, '🔎');

    try {
        backups = await client.backups();

        output.debug('Existing backups:', backups);
    } catch (exception) {
        output.debug(exception);
        output.error(`Cleanup failed due to an error response from the DatoCMS API.`);
    }

    const backupsOlderThanRetentionDate = backups.filter((backup: BackupEnvironment): boolean => {
        return DateTime.fromISO(backup.meta.createdAt) < retentionDate;
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
            output.misconfig(`Argument 'age' must be a valid ISO8601 duration string. E.g. "5d", "1w", "P1YT6H", ...`);
        }

        const smallestDurationUnit = durationUnits.pop();

        return DateTime.local().startOf(smallestDurationUnit).minus(duration);
    }

    async function deleteBackup(backup: BackupEnvironment): Promise<void> {
        output.line(`Deleting backup '${backup.id}'...`, '>');

        try {
            const response = await client.deleteEnvironmentById(backup.id);

            output.debug('Deleted backup:', response);
        } catch (exception) {
            output.debug(exception);
            output.error(
                `Cleanup failed due to an error response from the DatoCMS API while deleting backup '${backup.id}'.`,
            );
        }
    }
}
