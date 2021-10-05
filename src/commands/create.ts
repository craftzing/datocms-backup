import { DateTime } from 'luxon';
import { createOutput, Output } from '../output';
import { createClient, Dato } from '../dato';
import { Command, Arguments, Options } from '../command';

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
    options: [
        {
            flag: 'debug',
            shortFlag: 'd',
            description: 'Display debugging info',
        },
    ],
    handle,
}

type CreateArguments = Arguments & {
    environmentId: string
}

type CreateOptions = Options & {
    debug: boolean
}

async function handle(args: CreateArguments, options: CreateOptions): Promise<void> {
    const output = createOutput(options);
    const client = createClient();
    const environmentIdToBackup = await resolveEnvironmentId(output, client, args.environmentId);
    const backupId = await createBackupForEnvironment(output, client, environmentIdToBackup);

    output.completed(`Backup "${backupId}" completed.`);
}

async function resolveEnvironmentId(output: Output, client: Dato, environmentId: string): Promise<string> {
    if (environmentId !== PRIMARY_ENV_ALIAS) {
        return environmentId;
    }

    output.line('Resolving primary environment...', '🔎');

    const primaryEnvironmentId = await client.primaryEnvironmentId();

    output.debug(`Found "${primaryEnvironmentId}"`);

    return primaryEnvironmentId;
}

async function createBackupForEnvironment(output: Output, client: Dato, environmentId: string): Promise<string> {
    const backupId = `backup-${DateTime.local().toFormat('yyyy-LL-dd')}`;

    output.line(`Creating backup for "${environmentId}" environment...`, '⏳');

    try {
        const backup = await client.forkEnvironment(environmentId, backupId);

        output.debug(backup);
    } catch (exception) {
        output.debug(exception);
        output.error(`Backup "${backupId}" failed due to an error response from the DatoCMS API.`);
    }

    return backupId;
}
