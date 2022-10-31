import { buildClient } from '@datocms/cma-client-node';
import { CannotCreateDatoClient } from './errors/misconfigurationErrors';
import { createClient, Dato, Environment } from './dato';
import * as DatoFake from './dato.fake';

jest.mock('@datocms/cma-client-node', () => ({
    buildClient: jest.fn(() => DatoFake.client),
}));

describe('client', () => {
    const DATOCMS_BACKUP_API_TOKEN = 'some-fake-api-token';
    const DATOCMS_BACKUP_ASSETS_PROXY = 'some-fake-assets.proxy/content-assets';

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

        expect(buildClient).toHaveBeenCalledWith({ apiToken: DATOCMS_BACKUP_API_TOKEN });
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
        expect(DatoFake.client.environments.fork).toHaveBeenCalledWith(environmentId, { id: forkId });
    });

    it('can delete a backup environment by ID', async () => {
        const client: Dato = createClient();
        const backup = DatoFake.backup();

        const deletedBackup = await client.deleteEnvironmentById(backup.id);

        expect(deletedBackup).toEqual(backup);
        expect(DatoFake.client.environments.destroy).toHaveBeenCalledWith(backup.id);
    });

    it('can get a full data dump', async () => {
        const client: Dato = createClient();

        const dataDump = await client.dataDump();

        expect(dataDump).toEqual(DatoFake.dataDump);
        expect(DatoFake.client.items.listPagedIterator).toHaveBeenCalled();
    });

    it('can get all asset URIs', async () => {
        const client: Dato = createClient();

        const assetURIs = await client.assetURIs();

        expect(assetURIs).toContainEqual(
            expect.stringContaining(`https://${DatoFake.imgixHost}/`),
        );
        expect(DatoFake.client.uploads.listPagedIterator).toHaveBeenCalled();
    });

    it('can get all asset URIs using a custom proxy domain', async () => {
        process.env.DATOCMS_BACKUP_ASSETS_PROXY = DATOCMS_BACKUP_ASSETS_PROXY;
        const client: Dato = createClient();

        const assetURIs = await client.assetURIs();

        expect(assetURIs).toContainEqual(
            expect.stringContaining(`https://${DATOCMS_BACKUP_ASSETS_PROXY}/`),
        );
        expect(DatoFake.client.uploads.listPagedIterator).toHaveBeenCalled();
    });
});
