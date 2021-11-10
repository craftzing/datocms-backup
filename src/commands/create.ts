import { DateTime } from 'luxon';
import { Output } from '../output';
import { createClient, BackupEnvironmentId } from '../dato';
import { Arguments, Options, OptionDefinition, ArgumentDefinition } from '../command';
import { DEBUG } from '../common/options';
import { BackupFailed } from '../errors/runtimeErrors';

const PRIMARY_ENV_ALIAS = 'primary';

export const name: string = 'create';

export const args: ArgumentDefinition[] = [
    {
        name: 'environmentId',
        description: 'ID of the environment you want to backup',
        defaultValue: PRIMARY_ENV_ALIAS,
    },
];

export const options: OptionDefinition[] = [
    DEBUG,
];

export type CreateArguments = Arguments & {
    environmentId: string
}

export type CreateOptions = Options & {
    debug: boolean
}

export async function handle(args: CreateArguments, options: CreateOptions, output: Output): Promise<void> {
    const client = createClient();
    const environmentIdToBackup = await resolveEnvironmentId();
    const backupId: BackupEnvironmentId = `backup-${DateTime.local().toFormat('yyyy-LL-dd')}`;

    output.line(`Creating backup for "${environmentIdToBackup}" environment on ${options.destination}...`, '⏳');

    try {
        const backup = await client.forkEnvironment(environmentIdToBackup, backupId);

        output.debug(backup);
    } catch (error) {
        throw BackupFailed.datoApiRespondedWithAnErrorWhileCreatingBackup(backupId, error);
    }

    output.completed(`Backup "${backupId}" completed.`);

    async function resolveEnvironmentId(): Promise<string> {
        if (args.environmentId !== PRIMARY_ENV_ALIAS) {
            return args.environmentId;
        }

        output.line('Resolving primary environment...', '🔎');

        try {
            const primaryEnvironmentId = await client.primaryEnvironmentId();

            output.debug(`Found "${primaryEnvironmentId}"`);

            return primaryEnvironmentId;
        } catch (error) {
            throw BackupFailed.datoApiRespondedWithAnErrorWhileResolvingPrimaryEnvironment(error);
        }
    }
}
