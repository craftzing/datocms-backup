import { SiteClient } from 'datocms-client';
import { CannotInitialiseDatoClient } from './errors/misconfiguration';
import { createClient, Dato, Environment } from './dato';
import { siteClient, fakePrimaryEnvironment, fakeBackup, fakeSandboxEnvironment } from './dato.fake';

const DATOCMS_BACKUP_API_TOKEN = 'some-fake-api-token';

jest.mock('datocms-client', () => ({
    ...jest.requireActual<object>('datocms-client'),
    SiteClient: jest.fn(() => siteClient),
}));

beforeEach(() => {
    process.env = {
        DATOCMS_BACKUP_API_TOKEN,
    };
});

describe('client', () => {
    it('throws a misconfig error when the DATOCMS_BACKUP_API_TOKEN env variable is missing', (): void => {
        process.env = {};

        try {
            createClient();
        } catch (error) {
            expect(error).toBeInstanceOf(CannotInitialiseDatoClient);
            expect(error).toEqual(CannotInitialiseDatoClient.missingApiToken());
        }
    });

    it('can be created with the appropriate API token', (): void => {
        createClient();

        expect(SiteClient).toHaveBeenCalledWith(DATOCMS_BACKUP_API_TOKEN);
    });

    it("returns an empty array when getting backups when there aren't any", async () => {
        const client: Dato = createClient();
        fakePrimaryEnvironment();
        fakeSandboxEnvironment();

        const backups = await client.backups();

        expect<Environment[]>(backups).toEqual([]);
    });

    it('can get all backups', async () => {
        const client: Dato = createClient();
        fakePrimaryEnvironment();
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
        fakePrimaryEnvironment();
        fakeSandboxEnvironment();

        const primaryEnvironmentId = await client.primaryEnvironmentId();

        expect<string>(primaryEnvironmentId).toEqual('main');
    });

    it('can backup an environment', async () => {
        const client: Dato = createClient();
        const environmentId = 'main';
        const forkId = 'backup-some-timestamp';
        fakePrimaryEnvironment();

        const backup = await client.forkEnvironment(environmentId, forkId);

        expect(backup).toEqual(
            expect.objectContaining({
                id: forkId,
            }),
        );
        expect(siteClient.environments.fork).toHaveBeenCalledWith(environmentId, { id: forkId });
    });

    it('can delete a backup environment by ID', async () => {
        const client: Dato = createClient();
        const backup = fakeBackup();

        const deletedBackup = await client.deleteEnvironmentById(backup.id);

        expect(deletedBackup).toEqual(backup);
        expect(siteClient.environments.destroy).toHaveBeenCalledWith(backup.id);
    });
});
