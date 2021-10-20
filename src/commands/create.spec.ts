import { freezeNow } from '../../.jest/utils/dateTime';
import { ArgumentDefinition, OptionDefinition } from '../command';
import { output } from '../output.fake';
import {
    client,
    fakePrimaryEnvironment,
    fakeBackup,
    fakeSandboxEnvironment,
    fakeErrorWhileResolvingPrimaryId,
    fakeErrorWhileCreatingBackup,
} from '../dato.fake';
import { COMMAND } from './create';

jest.mock('../dato', () => ({
    ...jest.requireActual<object>('../dato'),
    createClient: jest.fn(() => client),
}));

function resolveExpectedBackupId(): string {
    const now = freezeNow().toFormat('yyyy-LL-dd');

    return `backup-${now}`;
}

describe('command', () => {
    it('should have a descriptive name', () => {
        expect(COMMAND.name).toEqual('create');
    });

    it('should have arguments', () => {
        expect(COMMAND.arguments).toEqual<ArgumentDefinition[]>([
            {
                name: 'environmentId',
                description: expect.any(String),
                defaultValue: 'primary',
            },
        ]);
    });

    it('should have options', () => {
        expect(COMMAND.options).toEqual<OptionDefinition[]>([
            {
                flag: 'debug',
                shortFlag: 'd',
                description: expect.any(String),
            },
        ]);
    });

    it('should not have subcommands', () => {
        expect(COMMAND.subCommands).toEqual(undefined);
    });

    it('should exit with an error when it failed to resolve the primary environment', async () => {
        fakeErrorWhileResolvingPrimaryId();

        await COMMAND.handle(
            { environmentId: 'primary' },
            { debug: false },
            output,
        );

        expect(output.error).toHaveBeenCalledTimes(1);
        expect(output.error).toHaveBeenCalledWith(
            expect.stringContaining('primary environment'),
        );
    });

    it('can create backups for the primary environment', async () => {
        const primary = fakePrimaryEnvironment();
        fakeBackup();
        fakeSandboxEnvironment();
        const expectedBackupId = resolveExpectedBackupId();

        await COMMAND.handle(
            { environmentId: 'primary' },
            { debug: false },
            output,
        );

        expect(client.forkEnvironment).toHaveBeenCalledTimes(1);
        expect(client.forkEnvironment).toHaveBeenCalledWith(primary.id, expectedBackupId);
        expect(output.completed).toHaveBeenCalledTimes(1);
        expect(output.completed).toHaveBeenCalledWith(
            expect.stringContaining(expectedBackupId),
        );
    });

    it('should exit with an error when it failed to create a backup', async () => {
        const env = fakePrimaryEnvironment();
        fakeErrorWhileCreatingBackup();
        const expectedBackupId = resolveExpectedBackupId();

        await COMMAND.handle(
            { environmentId: env.id },
            { debug: false },
            output,
        );

        expect(output.error).toHaveBeenCalledTimes(1);
        expect(output.error).toHaveBeenCalledWith(
            expect.stringContaining(expectedBackupId),
        );
    });

    it('can create backups for any existing environment', async () => {
        fakePrimaryEnvironment();
        const env = fakeSandboxEnvironment();
        const expectedBackupId = resolveExpectedBackupId();

        await COMMAND.handle(
            { environmentId: env.id },
            { debug: false },
            output,
        );

        expect(output.debug).toHaveBeenCalled();
        expect(client.forkEnvironment).toHaveBeenCalledTimes(1);
        expect(client.forkEnvironment).toHaveBeenCalledWith(env.id, expectedBackupId);
        expect(output.completed).toHaveBeenCalledTimes(1);
        expect(output.completed).toHaveBeenCalledWith(
            expect.stringContaining(expectedBackupId),
        );
    });
});