import { freezeNow } from '../../.jest/utils/dateTime';
import { ArgumentDefinition, OptionDefinition } from '../command';
import { output } from '../output.fake';
import * as DatoFake from '../dato.fake';
import { BackupEnvironmentId } from '../dato';
import { BackupFailed, RuntimeError } from '../errors/runtimeErrors';
import * as Command from './create';

jest.mock('../dato', () => ({
    ...jest.requireActual<object>('../dato'),
    createClient: jest.fn(() => DatoFake.client),
}));

function resolveExpectedBackupId(): BackupEnvironmentId {
    const now = freezeNow().toFormat('yyyy-LL-dd');

    return `backup-${now}`;
}

describe('command', () => {
    const defaultOptions: Command.CreateOptions = {
        debug: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        DatoFake.reset();
    });

    it('should have a descriptive name', () => {
        expect(Command.name).toEqual('create');
    });

    it('should have arguments', () => {
        expect(Command.args).toEqual<ArgumentDefinition[]>([
            {
                name: 'environmentId',
                description: expect.any(String),
                defaultValue: 'primary',
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

    it('should exit with an error when it failed to resolve the primary environment', async () => {
        DatoFake.throwErrorWhileResolvingPrimaryId();

        try {
            await Command.handle(
                { environmentId: 'primary' },
                defaultOptions,
                output,
            );
        } catch (error) {
            expect(error).toBeInstanceOf(RuntimeError);
            expect(error).toBeInstanceOf(BackupFailed);
        }
    });

    it('can create backups for the primary environment', async () => {
        const primary = DatoFake.primaryEnvironment();
        DatoFake.backup();
        DatoFake.sandboxEnvironment();
        const expectedBackupId = resolveExpectedBackupId();

        await Command.handle(
            { environmentId: 'primary' },
            defaultOptions,
            output,
        );

        expect(DatoFake.client.forkEnvironment).toHaveBeenCalledTimes(1);
        expect(DatoFake.client.forkEnvironment).toHaveBeenCalledWith(primary.id, expectedBackupId);
        expect(output.completed).toHaveBeenCalledTimes(1);
        expect(output.completed).toHaveBeenCalledWith(
            expect.stringContaining(expectedBackupId),
        );
    });

    it('should exit with an error when it failed to create a backup', async () => {
        const env = DatoFake.primaryEnvironment();
        DatoFake.throwErrorWhileCreatingBackup();

        try {
            await Command.handle(
                { environmentId: env.id },
                defaultOptions,
                output,
            );
        } catch (error) {
            expect(error).toBeInstanceOf(RuntimeError);
            expect(error).toBeInstanceOf(BackupFailed);
        }
    });

    it('can create backups for any existing environment', async () => {
        DatoFake.primaryEnvironment();
        const env = DatoFake.sandboxEnvironment();
        const expectedBackupId = resolveExpectedBackupId();

        await Command.handle(
            { environmentId: env.id },
            defaultOptions,
            output,
        );

        expect(output.debug).toHaveBeenCalled();
        expect(DatoFake.client.forkEnvironment).toHaveBeenCalledTimes(1);
        expect(DatoFake.client.forkEnvironment).toHaveBeenCalledWith(env.id, expectedBackupId);
        expect(output.completed).toHaveBeenCalledTimes(1);
        expect(output.completed).toHaveBeenCalledWith(
            expect.stringContaining(expectedBackupId),
        );
    });
});
