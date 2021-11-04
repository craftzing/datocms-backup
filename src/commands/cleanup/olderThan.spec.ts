import { DateTime } from 'luxon';
import { expectOutputToBeCanceled, expectOutputToBeCompleted } from '../../../.jest/utils/output';
import { FailedToStartCleanup, Misconfiguration } from '../../errors/misconfiguration';
import { fakeConfirmation, output } from '../../output.fake';
import { client, fakeBackup, fakeErrorWhileGettingBackups } from '../../dato.fake';
import { BackupEnvironment } from '../../dato';
import { ArgumentDefinition, OptionDefinition } from '../../command';
import { COMMAND } from './olderThan';

jest.mock('../../dato', () => ({
    ...jest.requireActual<object>('../../dato'),
    createClient: jest.fn(() => client),
}));

describe('command', () => {
    it('should have a descriptive name', () => {
        expect(COMMAND.name).toEqual('older-than');
    });

    it('should have arguments', () => {
        expect(COMMAND.arguments).toEqual<ArgumentDefinition[]>([
            {
                name: 'age',
                description: expect.any(String),
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
            {
                flag: 'confirm',
                shortFlag: 'y',
                description: expect.any(String),
            },
        ]);
    });

    it('should not have subcommands', () => {
        expect(COMMAND.subCommands).toEqual(undefined);
    });

    const invalidAges = [
        ['nonsense'],
        ['1ymd'],
        ['1Y2H'],
    ];

    it.each(invalidAges)('should throw a misconfig error when the provided age is invalid', async (age: string) => {
        try {
            await COMMAND.handle(
                { age },
                { debug: false },
                output,
            );
        } catch (error) {
            expect(error).toBeInstanceOf(Misconfiguration);
            expect(error).toEqual(FailedToStartCleanup.argumentAgeIsInvalid(age));
        }
    });

    it('should exit with an error when it failed to retrieve all existing backups', async () => {
        fakeErrorWhileGettingBackups();

        await COMMAND.handle(
            { age: '1d' },
            { debug: false },
            output,
        );

        expect(output.error).toHaveBeenCalledTimes(1);
        expect(output.error).toHaveBeenCalledWith(
            expect.stringContaining('Cleanup failed'),
        );
    });

    it('can handle cleanup when there are no backups', async () => {
        await COMMAND.handle(
            { age: '1w' },
            { debug: false },
            output,
        );

        expect(client.deleteEnvironmentById).not.toHaveBeenCalled();
        expectOutputToBeCompleted(output);
    });

    it('can handle cleanup when there are no backups older than the retention date', async () => {
        fakeBackup(DateTime.local().minus({ weeks: 1 }).toISO());

        await COMMAND.handle(
            { age: '2w' },
            { debug: false },
            output,
        );

        expect(client.deleteEnvironmentById).not.toHaveBeenCalled();
        expectOutputToBeCompleted(output);
    });

    it('does not cleanup backups when confirmation is rejected', async () => {
        fakeBackup(DateTime.local().minus({ days: 3 }).toISO());

        await COMMAND.handle(
            { age: '2d' },
            { debug: false },
            output,
        );

        expect(client.deleteEnvironmentById).not.toHaveBeenCalled();
        expectOutputToBeCanceled(output);
        expect(output.confirm).toHaveBeenCalledTimes(1);
        expect(output.confirm).toHaveBeenCalledWith(
            expect.stringContaining('Are you sure'),
        );
    });

    it('can cleanup backups older than the specified age when confirmed', async () => {
        const backupToDelete = fakeBackup(DateTime.local().minus({ months: 2 }).toISO());
        const backupToKeep = fakeBackup(DateTime.local().minus({ months: 1 }).toISO());
        fakeConfirmation();

        await COMMAND.handle(
            { age: '1m' },
            { debug: false },
            output,
        );

        await expectBackupNotToBeDeleted(backupToKeep);
        await expectBackupToBeDeleted(backupToDelete);
        expectOutputToBeCompleted(output);
    });
});

async function expectBackupNotToBeDeleted(backup: BackupEnvironment): Promise<void> {
    expect(client.deleteEnvironmentById).not.toHaveBeenCalledWith(backup.id);
}

async function expectBackupToBeDeleted(backup: BackupEnvironment): Promise<void> {
    expect(client.deleteEnvironmentById).toHaveBeenCalledWith(backup.id);
}
