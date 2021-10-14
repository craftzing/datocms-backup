import { SiteClient } from 'datocms-client';
import { createClient, Dato, Environment } from './dato';
import { fakeSiteClient, fakeMainEnvironment, fakeBackup, fakeSandboxEnvironment } from './dato.fake';

jest.mock('datocms-client', () => ({
    ...jest.requireActual<object>('datocms-client'),
    SiteClient: jest.fn(() => fakeSiteClient),
}));

describe('client', () => {
    it('can be created with the appropriate API token', (): void => {
        createClient();

        expect(SiteClient).toHaveBeenCalledWith(process.env.DATOCMS_BACKUP_API_TOKEN);
    });

    it("returns an empty array when getting backups when there aren't any", async () => {
        const client: Dato = createClient();
        fakeMainEnvironment();
        fakeSandboxEnvironment();

        const backups = await client.backups();

        expect<Environment[]>(backups).toEqual([]);
    });

    it('can get all backups', async () => {
        const client: Dato = createClient();
        fakeMainEnvironment();
        const expectation = [
            fakeBackup(),
            fakeBackup(),
        ];
        fakeSandboxEnvironment();

        const backups = await client.backups();

        expect<Environment[]>(backups).toEqual(expectation);
    });

    it('can return the primary environment id', async () => {
        const client: Dato = createClient();
        fakeBackup();
        fakeMainEnvironment();
        fakeSandboxEnvironment();

        const primaryEnvironmentId = await client.primaryEnvironmentId();

        expect<string>(primaryEnvironmentId).toEqual('main');
    });

    it('can backup an environment', async () => {
        const client: Dato = createClient();
        const environmentId = 'main';
        const forkId = 'backup-some-timestamp';
        fakeMainEnvironment();

        const backup = await client.forkEnvironment(environmentId, forkId);

        expect(backup).toEqual(
            expect.objectContaining({
                id: forkId,
            }),
        );
        expect(fakeSiteClient.environments.fork).toHaveBeenCalledWith(environmentId, { id: forkId });
    });

    it('can delete a backup environment by ID', async () => {
        const client: Dato = createClient();
        const backup = fakeBackup();

        const deletedBackup = await client.deleteEnvironmentById(backup.id);

        expect(deletedBackup).toEqual(backup);
        expect(fakeSiteClient.environments.destroy).toHaveBeenCalledWith(backup.id);
    });
});
