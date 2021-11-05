import { SiteClient } from 'datocms-client';
import { CannotCreateDatoClient } from './errors/misconfigurationErrors';

export type Environment = {
    readonly id: string
    readonly meta: {
        readonly primary: boolean
        readonly createdAt: string
    }
}

export type BackupEnvironment = Environment & {
    readonly id: BackupEnvironmentId
}

export type BackupEnvironmentId = `backup-${string}`;

export type Dato = {
    backups: () => Promise<BackupEnvironment[]>
    primaryEnvironmentId: () => Promise<string>
    forkEnvironment: (environmentId: string, forkId: BackupEnvironmentId) => Promise<Environment>
    deleteEnvironmentById: (environmentId: BackupEnvironmentId) => Promise<BackupEnvironment>
    dataDump: () => Promise<string>
}

export function createClient(): Dato {
    const siteClient: SiteClient = createSiteClient();

    function createSiteClient(): SiteClient {
        const apiToken = process.env.DATOCMS_BACKUP_API_TOKEN;

        if (! apiToken) {
            throw CannotCreateDatoClient.missingApiToken();
        }

        return new SiteClient(apiToken);
    }

    return {
        async backups(): Promise<BackupEnvironment[]> {
            const environments = await siteClient.environments.all();

            return environments.filter(isBackupEnvironment);
        },

        async primaryEnvironmentId(): Promise<string> {
            const envs: [Environment] = await siteClient.environments.all();

            return envs.find(isPrimaryEnvironment).id;
        },

        async forkEnvironment(environmentId: string, forkId: BackupEnvironmentId): Promise<Environment> {
            return siteClient.environments.fork(environmentId, { id: forkId });
        },

        async deleteEnvironmentById(environmentId: BackupEnvironmentId): Promise<BackupEnvironment> {
            return siteClient.environments.destroy(environmentId);
        },

        async dataDump(): Promise<string> {
            const response = await siteClient.items.all({}, { allPages: true });

            return JSON.stringify(response, null, 2);
        },
    }
}

export function isPrimaryEnvironment(env: Environment): boolean {
    return env.meta.primary === true;
}

export function isBackupEnvironment(backup: Environment): backup is BackupEnvironment {
    return backup.id.startsWith('backup-');
}
