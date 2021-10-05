import { DateTime } from 'luxon';
import { createClient, Dato } from '../dato';
import { Command } from '../command';
import * as Output from '../output';

const PRIMARY_ENV_ALIAS = 'primary';

export const COMMAND: Command = {
    name: 'create',
    arguments: [
        {
            name: 'environmentId',
            description: 'ID of the environment you want to backup',
            defaultValue: PRIMARY_ENV_ALIAS,
        },
    ],
    handle,
}

async function handle(environmentId: string): Promise<void> {
    const client = createClient();
    const environmentIdToBackup = await resolveEnvironmentId(client, environmentId);
    const backupId = await createBackupForEnvironment(client, environmentIdToBackup);

    Output.completed(`Backup "${backupId}" completed.`);
    process.exit(0);
}

async function resolveEnvironmentId(client: Dato, environmentId: string): Promise<string> {
    if (environmentId !== PRIMARY_ENV_ALIAS) {
        return environmentId;
    }

    Output.line('Resolving primary environment...', '🔎');

    const primaryEnvironmentId = await client.primaryEnvironmentId();

    return primaryEnvironmentId;
}

async function createBackupForEnvironment(client: Dato, environmentId: string): Promise<string> {
    const backupId = `backup-${DateTime.local().toFormat('yyyy-LL-dd')}`;

    Output.line(`Creating backup for "${environmentId}" environment...`, '⏳');

    try {
        const backup = await client.forkEnvironment(environmentId, backupId);
    } catch (exception) {
        Output.error(`Backup "${backupId}" failed due to an error response from the DatoCMS API.`);
        process.exit(1);
    }

    return backupId;
}
