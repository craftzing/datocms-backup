import { SiteClient } from 'datocms-client';

export type Dato = {
    primaryEnvironmentId: () => Promise<string>
    forkEnvironment: (environmentId: string, forkId: string) => Promise<object>
}

type Environment = {
    readonly id: string
    readonly meta: {
        readonly primary: boolean
    }
}

function isPrimaryEnvironment(env: Environment): boolean {
    return env.meta.primary === true;
}

export function createClient(): Dato {
    const siteClient = new SiteClient(process.env.DATOCMS_BACKUP_API_TOKEN);

    async function primaryEnvironmentId(): Promise<string> {
        const environments: [Environment] = await siteClient.environments.all();

        return environments.find(isPrimaryEnvironment).id;
    }

    async function forkEnvironment(environmentId: string, forkId: string): Promise<object> {
        return siteClient.environments.fork(environmentId, { id: forkId });
    }

    return {
        primaryEnvironmentId,
        forkEnvironment,
    };
}
