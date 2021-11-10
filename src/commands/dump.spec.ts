import { freezeNow } from '../../.jest/utils/dateTime';
import { ArgumentDefinition, OptionDefinition, Options } from '../command';
import { BackupEnvironmentId } from '../dato';
import { Driver } from '../storage';
import * as StorageFake from '../storage.fake';
import * as DatoFake from '../dato.fake';
import { output } from '../output.fake';
import { DumpFailed } from '../errors/runtimeErrors';
import * as Command from './dump';

jest.mock('../dato', () => ({
    ...jest.requireActual<object>('../dato'),
    createClient: jest.fn(() => DatoFake.client),
}));

jest.mock('../storage', () => ({
    ...jest.requireActual<object>('../storage'),
    createStorage: jest.fn((driver: Driver) => StorageFake.createWithDriver(driver)),
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

    beforeEach(() => {
        jest.clearAllMocks();
        DatoFake.reset();
        StorageFake.reset();
    });

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
        DatoFake.throwErrorWhileGettingDataDump();

        try {
            await Command.handle(args, defaultOptions, output);
        } catch (error) {
            expect(error).toBeInstanceOf(DumpFailed);
            expect(error.originalError).toEqual(DatoFake.errors.dataDump);
        }
    });

    it('fails when it could not upload the data dump to a storage service', async () => {
        StorageFake.throwErrorWhileUploadingToStorage();

        try {
            await Command.handle(args, defaultOptions, output);
        } catch (error) {
            expect(error).toBeInstanceOf(DumpFailed);
            expect(error.originalError).toEqual(StorageFake.errors.upload);
        }
    });

    it('can upload a data dump without assets to a storage service', async () => {
        const expectedBackupId = resolveExpectedBackupId();
        const expectedPath = `${args.path}/${expectedBackupId}/data.json`;

        await Command.handle(args, defaultOptions, output);

        expect(StorageFake.usedDriver).toEqual(args.storage);
        expect(StorageFake.storage.upload).toHaveBeenCalledTimes(1);
        expect(StorageFake.storage.upload).toHaveBeenCalledWith(expectedPath, DatoFake.dataDump);
    });

    it('can upload a data dump without assets to a storage service', async () => {
        const expectedBackupId = resolveExpectedBackupId();
        const expectedPath = `${args.path}/${expectedBackupId}/data.json`;
        const firstAssetURI = 'https://some.fake/assets/1.jpg';
        const lastAssetURI = 'https://some.fake/assets/2.svg';
        DatoFake.willReturnAssetURIs(firstAssetURI, lastAssetURI);

        await Command.handle(args, defaultOptions, output);

        expect(StorageFake.usedDriver).toEqual(args.storage);
        expect(StorageFake.storage.upload).toHaveBeenCalledTimes(1);
        expect(StorageFake.storage.upload).toHaveBeenCalledWith(expectedPath, DatoFake.dataDump);
        expect(StorageFake.storage.uploadFromUri).toHaveBeenCalledTimes(2);
        expect(StorageFake.storage.uploadFromUri).toHaveBeenCalledWith(
            `${args.path}/${expectedBackupId}/assets/1.jpg`,
            firstAssetURI,
        );
        expect(StorageFake.storage.uploadFromUri).toHaveBeenCalledWith(
            `${args.path}/${expectedBackupId}/assets/2.svg`,
            lastAssetURI,
        );
    });
});
