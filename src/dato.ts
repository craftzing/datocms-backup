import { buildClient, Client } from '@datocms/cma-client-node';
import { CannotCreateDatoClient } from './errors/misconfigurationErrors';

export type Environment = {
    readonly id: string
    readonly meta: {
        readonly primary: boolean
        readonly created_at: string
    }
}

export type BackupEnvironment = Environment & {
    readonly id: BackupEnvironmentId
}

export type BackupEnvironmentId = `backup-${string}`;

export type Dato = {
    backups(): Promise<BackupEnvironment[]>
    primaryEnvironmentId(): Promise<string>
    forkEnvironment(environmentId: string, forkId: BackupEnvironmentId): Promise<Environment>
    deleteEnvironmentById(environmentId: BackupEnvironmentId): Promise<BackupEnvironment>
    dataDump(): Promise<string>
    assetURIs(): Promise<Array<string>>
}

export function createClient(): Dato {
    const client: Client = createClient();
    const assetsProxy: string = process.env.DATOCMS_BACKUP_ASSETS_PROXY;

    function createClient(): Client {
        const apiToken = process.env.DATOCMS_BACKUP_API_TOKEN;

        if (! apiToken) {
            throw CannotCreateDatoClient.missingApiToken();
        }

        return buildClient({ apiToken });
    }

    return {
        async backups(): Promise<BackupEnvironment[]> {
            const environments = await client.environments.list();

            return environments.filter(isBackupEnvironment) as BackupEnvironment[];
        },

        async primaryEnvironmentId(): Promise<string> {
            const envs = await client.environments.list();

            return envs.find(isPrimaryEnvironment).id;
        },

        async forkEnvironment(environmentId: string, forkId: BackupEnvironmentId): Promise<Environment> {
            return client.environments.fork(environmentId, { id: forkId });
        },

        async deleteEnvironmentById(environmentId: BackupEnvironmentId): Promise<BackupEnvironment> {
            return client.environments.destroy(environmentId) as Promise<BackupEnvironment>;
        },

        async dataDump(): Promise<string> {
            const items = [];

            for await (const item of client.items.listPagedIterator()) {
                items.push(item);
            }

            return JSON.stringify(items, null, 2);
        },

        async assetURIs(): Promise<Array<string>> {
            const assetsHost = assetsProxy || (await client.site.find()).imgix_host;
            const uploads = [];

            for await (const upload of client.uploads.listPagedIterator()) {
                uploads.push(upload);
            }

            return uploads.map<string>(({ path }: { path: string }) => `https://${assetsHost}${path}`);
        }
    }
}

export function isPrimaryEnvironment(env: Environment): boolean {
    return env.meta.primary === true;
}

export function isBackupEnvironment(backup: Environment | BackupEnvironment): backup is BackupEnvironment {
    return backup.id.startsWith('backup-');
}
