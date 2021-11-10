import { URL } from 'url';
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

    const [dataDump, assetURIs] = await Promise.all([
        getDataDump(),
        getAssetURIs(),
    ]);

    await Promise.all([
        uploadDataDumpToStorage(),
        uploadAssetsToStorage(),
    ]);

    output.completed(`Dump "${path}" on "${args.storage}" completed.`);

    async function getDataDump(): Promise<string> {
        output.line('Fetching all data from DatoCMS...', '🔎');

        try {
            return await dato.dataDump();
        } catch (error) {
            throw DumpFailed.datoApiRespondedWithAnErrorWhileGettingDataDump(error);
        }
    }

    async function getAssetURIs(): Promise<Array<string>> {
        output.line('Fetching all assets from DatoCMS...', '🔎');

        try {
            return await dato.assetURIs();
        } catch (error) {
            throw DumpFailed.datoApiRespondedWithAnErrorWhileGettingDataDump(error);
        }
    }

    async function uploadDataDumpToStorage(): Promise<void> {
        output.line(`Uploading data dump to ${args.storage}...`, '🏄');

        try {
            await storage.upload(`${path}/data.json`, dataDump);
        } catch (error) {
            throw DumpFailed.storageApiRespondedWithAnErrorWhileUploadingData(error);
        }
    }

    async function uploadAssetsToStorage(): Promise<void> {
        output.line(`Uploading ${assetURIs.length} asset(s) to ${args.storage}...`, '🏄');

        for (const assetURI of assetURIs) {
            const fileName: string = new URL(assetURI).pathname;
            const assetPathOnStorage: string = `${path}${fileName}`;

            try {
                await storage.uploadFromUri(assetPathOnStorage, assetURI);
            } catch (error) {
                throw DumpFailed.errorWhileUploadingAsset(assetPathOnStorage, error);
            }

            output.line(`${assetPathOnStorage} uploaded!`, '>');
        }
    }
}
