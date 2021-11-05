import { DateTime } from 'luxon';
import { ArgumentDefinition, Arguments, OptionDefinition, Options } from '../command';
import { Output } from '../output';
import { DEBUG } from '../common/options';
import { createClient, Dato, BackupEnvironmentId } from '../dato';
import { createStorage, Driver, Storage } from '../storage';
import { DumpFailed } from '../errors/runtimeErrors';

export const name: string = 'dump';

export const args: ArgumentDefinition[] = [
    {
        name: 'storage',
        description: 'Storage service to use for the data dump',
        choices: Object.values(Driver),
    },
    {
        name: 'path',
        description: 'The path you want to upload the data dump to in the storage service',
    },
];

export const options: OptionDefinition[] = [
    DEBUG,
];

export type DumpArguments = Arguments & {
    storage: Driver
    path: string
}

export async function handle(args: DumpArguments, options: Options, output: Output): Promise<void> {
    const dato: Dato = createClient();
    const storage: Storage = createStorage(args.storage);
    const backupId: BackupEnvironmentId = `backup-${DateTime.local().toFormat('yyyy-LL-dd')}`;
    const path = `${args.path}/`.replace('//', '/') + backupId;

    output.line(`Creating dump "${path}" on "${args.storage}"...`, '⏳');

    const dataDump: string = await getDataDump();

    try {
        await storage.upload(`${path}/data.json`, dataDump);
    } catch (error) {
        throw DumpFailed.s3ApiRespondedWithAnErrorWhileUploadingData(error);
    }

    output.completed(`Dump "${path}" on "${args.storage}" completed.`);

    async function getDataDump(): Promise<string> {
        output.line('Fetching all data from DatoCMS...', '🔎');

        try {
            return await dato.dataDump();
        } catch (error) {
            throw DumpFailed.datoApiRespondedWithAnErrorWhileGettingDataDump(error);
        }
    }
}
