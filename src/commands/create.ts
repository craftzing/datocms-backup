import { DateTime } from 'luxon';
import { Output } from '../output';
import { createClient, BackupEnvironmentId } from '../dato';
import { Arguments, Options, OptionDefinition, ArgumentDefinition} from '../command';
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
]

type CreateArguments = Arguments & {
    environmentId: string
}

type CreateOptions = Options & {
    debug: boolean
}

export async function handle(args: CreateArguments, options: CreateOptions, output: Output): Promise<void> {
    const client = createClient();
    const environmentIdToBackup = await resolveEnvironmentId();
    const backupId = await createBackupForEnvironment();

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
        } catch (exception) {
            output.debug(exception);

            throw BackupFailed.datoApiRespondedWithAnErrorWhileResolvingPrimaryEnvironment();
        }
    }

    async function createBackupForEnvironment(): Promise<string> {
        const backupId: BackupEnvironmentId = `backup-${DateTime.local().toFormat('yyyy-LL-dd')}`;

        output.line(`Creating backup for "${environmentIdToBackup}" environment...`, '⏳');

        try {
            const backup = await client.forkEnvironment(environmentIdToBackup, backupId);

            output.debug(backup);
        } catch (exception) {
            output.debug(exception);

            throw BackupFailed.datoApiRespondedWithAnErrorWhileCreatingBackup(backupId);
        }

        return backupId;
    }
}
