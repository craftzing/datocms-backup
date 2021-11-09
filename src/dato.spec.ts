import { SiteClient } from 'datocms-client';
import { CannotCreateDatoClient } from './errors/misconfigurationErrors';
import { createClient, Dato, Environment } from './dato';
import * as DatoFake from './dato.fake';

jest.mock('datocms-client', () => ({
    SiteClient: jest.fn(() => DatoFake.siteClient),
}));

describe('client', () => {
    const DATOCMS_BACKUP_API_TOKEN = 'some-fake-api-token';

    beforeEach(() => {
        jest.clearAllMocks();
        DatoFake.reset();
        process.env = {
            DATOCMS_BACKUP_API_TOKEN,
        };
    });

    it('throws a misconfig error when the DATOCMS_BACKUP_API_TOKEN env variable is missing', (): void => {
        process.env = {};

        try {
            createClient();
        } catch (error) {
            expect(error).toBeInstanceOf(CannotCreateDatoClient);
            expect(error).toEqual(CannotCreateDatoClient.missingApiToken());
        }
    });

    it('can be created with the appropriate API token', (): void => {
        createClient();

        expect(SiteClient).toHaveBeenCalledWith(DATOCMS_BACKUP_API_TOKEN);
    });

    it("returns an empty array when getting backups when there aren't any", async () => {
        const client: Dato = createClient();
        DatoFake.primaryEnvironment();
        DatoFake.sandboxEnvironment();

        const backups = await client.backups();

        expect<Environment[]>(backups).toEqual([]);
    });

    it('can get all backups', async () => {
        const client: Dato = createClient();
        DatoFake.primaryEnvironment();
        const expectation = [
            DatoFake.backup(),
            DatoFake.backup(),
        ];
        DatoFake.sandboxEnvironment();

        const backups = await client.backups();

        expect<Environment[]>(backups).toEqual(expectation);
    });

    it('can return the primary environment id', async () => {
        const client: Dato = createClient();
        DatoFake.backup();
        DatoFake.primaryEnvironment();
        DatoFake.sandboxEnvironment();

        const primaryEnvironmentId = await client.primaryEnvironmentId();

        expect<string>(primaryEnvironmentId).toEqual('main');
    });

    it('can backup an environment', async () => {
        const client: Dato = createClient();
        const environmentId = 'main';
        const forkId = 'backup-some-timestamp';
        DatoFake.primaryEnvironment();

        const backup = await client.forkEnvironment(environmentId, forkId);

        expect(backup).toEqual(
            expect.objectContaining({
                id: forkId,
            }),
        );
        expect(DatoFake.siteClient.environments.fork).toHaveBeenCalledWith(environmentId, { id: forkId });
    });

    it('can delete a backup environment by ID', async () => {
        const client: Dato = createClient();
        const backup = DatoFake.backup();

        const deletedBackup = await client.deleteEnvironmentById(backup.id);

        expect(deletedBackup).toEqual(backup);
        expect(DatoFake.siteClient.environments.destroy).toHaveBeenCalledWith(backup.id);
    });

    it('can get a full data dump', async () => {
        const client: Dato = createClient();

        const dataDump = await client.dataDump();

        expect(dataDump).toEqual(DatoFake.dataDump);
        expect(DatoFake.siteClient.items.all).toHaveBeenCalledWith({}, { allPages: true });
    });
});
