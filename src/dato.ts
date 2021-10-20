import { SiteClient } from 'datocms-client';

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
    backups: () => Promise<[BackupEnvironment?]>
    primaryEnvironmentId: () => Promise<string>
    forkEnvironment: (environmentId: string, forkId: BackupEnvironmentId) => Promise<Environment>
    deleteEnvironmentById: (environmentId: BackupEnvironmentId) => Promise<BackupEnvironment>
}

export function createClient(): Dato {
    const siteClient = new SiteClient(process.env.DATOCMS_BACKUP_API_TOKEN);

    return {
        async backups(): Promise<[BackupEnvironment?]> {
            const environments = await siteClient.environments.all();

            return environments.filter((backup: Environment): boolean => backup.id.startsWith('backup-'));
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
    }
}

export function isPrimaryEnvironment(env: Environment): boolean {
    return env.meta.primary === true;
}

