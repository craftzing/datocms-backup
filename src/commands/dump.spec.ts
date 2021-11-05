import { freezeNow } from '../../.jest/utils/dateTime';
import { ArgumentDefinition, OptionDefinition, Options } from '../command';
import { BackupEnvironmentId } from '../dato';
import { Driver } from '../storage';
import { storage, errors as storageErrors, fakeErrorWhileUploadingToStorage } from '../storage.fake';
import { client, errors as datoErrors, dataDump, fakeErrorWhileGettingDataDump } from '../dato.fake';
import { output } from '../output.fake';
import { DumpFailed } from '../errors/runtimeErrors';
import * as Command from './dump';

let storageDriver: string = undefined;

jest.mock('../dato', () => ({
    ...jest.requireActual<object>('../dato'),
    createClient: jest.fn(() => client),
}));

jest.mock('../storage', () => ({
    ...jest.requireActual<object>('../storage'),
    createStorage: jest.fn((driver: string) => {
        storageDriver = driver;

        return storage;
    }),
}));

function resolveExpectedBackupId(): BackupEnvironmentId {
    const now = freezeNow().toFormat('yyyy-LL-dd');

    return `backup-${now}`;
}

describe('command', () => {
    const args: Command.DumpArguments = {
        storage: Driver.S3,
        path: 'some/path',
    };
    const defaultOptions: Options = {
        debug: false,
    };

    it('should have a descriptive name', () => {
        expect(Command.name).toEqual('dump');
    });

    it('should have arguments', () => {
        expect(Command.args).toEqual<ArgumentDefinition[]>([
            {
                name: 'storage',
                description: expect.any(String),
                choices: [
                    Driver.S3,
                ],
            },
            {
                name: 'path',
                description: expect.any(String),
            },
        ]);
    });

    it('should have options', () => {
        expect(Command.options).toEqual<OptionDefinition[]>([
            {
                flag: 'debug',
                shortFlag: 'd',
                description: expect.any(String),
            },
        ]);
    });

    it('fails when it could not fetch data from DatoCMS', async () => {
        fakeErrorWhileGettingDataDump();

        try {
            await Command.handle(args, defaultOptions, output);
        } catch (error) {
            expect(error).toBeInstanceOf(DumpFailed);
            expect(error.originalError).toEqual(datoErrors.dataDump);
        }
    });

    it('fails when it could not upload the data dump to storage', async () => {
        fakeErrorWhileUploadingToStorage();

        try {
            await Command.handle(args, defaultOptions, output);
        } catch (error) {
            expect(error).toBeInstanceOf(DumpFailed);
            expect(error.originalError).toEqual(storageErrors.upload);
        }
    });

    it('can upload a data dump to storage', async () => {
        const expectedBackupId = resolveExpectedBackupId();
        const expectedPath = `${args.path}/${expectedBackupId}/data.json`;

        await Command.handle(args, defaultOptions, output);

        expect(storageDriver).toEqual(args.storage);
        expect(storage.upload).toHaveBeenCalledTimes(1);
        expect(storage.upload).toHaveBeenCalledWith(expectedPath, dataDump);
    });
});
