import { faker } from '@faker-js/faker';
import { DateTime } from 'luxon';
import { Dato, BackupEnvironment, BackupEnvironmentId, Environment, isBackupEnvironment } from './dato';

const PRIMARY_ENV_ID = 'main';
let environments: Environment[] = [];
let assetURIs: string[] = [];

export let errors: {
    [name: string]: Error | undefined
} = {};

export function reset(): void {
    environments = [];
    assetURIs = [];
    errors = {
        primaryEnvironmentId: undefined,
        backups: undefined,
        forkEnvironment: undefined,
        dataDump: undefined,
    };
}

export function throwErrorWhileResolvingPrimaryId(): void {
    errors.primaryEnvironmentId = new Error('Faked missing primary environment.');
}

export function throwErrorWhileGettingBackups(): void {
    errors.backups = new Error('Faked an error while getting backups.');
}

export function throwErrorWhileCreatingBackup(): void {
    errors.forkEnvironment = new Error('Faked an error while creating a backup.');
}

export function throwErrorWhileGettingDataDump(): void {
    errors.dataDump = new Error('Faked an error while creating a backup dump.');
}

function fakeEnvironments(...envs: Environment[]): void {
    environments = environments.concat(envs);
}

export function primaryEnvironment(): Environment {
    const env = {
        id: PRIMARY_ENV_ID,
        meta: {
            primary: true,
            created_at: faker.date.past(),
        },
    };

    fakeEnvironments(env);

    return env;
}

export function backup(isoBackupDate?: string): BackupEnvironment {
    isoBackupDate = isoBackupDate || faker.date.past().toISOString();
    const backupDate = DateTime.fromISO(isoBackupDate).toFormat('yyyy-LL-dd');
    const backupId: BackupEnvironmentId = `backup-${backupDate}`;
    const env = {
        id: backupId,
        meta: {
            primary: false,
            created_at: isoBackupDate,
        },
    };

    fakeEnvironments(env);

    return env;
}

export function sandboxEnvironment(id?: string): Environment {
    const env = {
        id: id ?? faker.lorem.word(),
        meta: {
            primary: false,
            created_at: faker.date.past(),
        },
    };

    fakeEnvironments(env);

    return env;
}

export function willReturnAssetURIs(...assetURI: string[]): void {
    assetURIs = assetURIs.concat(assetURI);
}

const datoItems = [
    { key: 'All DatoCMS data...' },
];
export const dataDump: string = JSON.stringify(datoItems, null, 2);
export const imgixHost = 'some.fake.imgix.host.com';
export const client = {
    site: {
        find() {
            return {
                imgix_host: imgixHost,
            };
        },
    },

    environments: {
        list(): Promise<Environment[]> {
            return Promise.resolve(environments);
        },

        fork: jest.fn((environmentId: string, { id }: { id: BackupEnvironmentId }): Promise<Environment> => {
            const fork = sandboxEnvironment(id);

            return Promise.resolve(fork);
        }),

        destroy: jest.fn((environmentId: string): Promise<BackupEnvironment> => {
            let deletedEnvironment = undefined;
            environments = environments.filter((env: Environment): boolean => {
                if (env.id !== environmentId) {
                    return true;
                }

                deletedEnvironment = env;

                return false;
            });

            return Promise.resolve(deletedEnvironment);
        }),
    },

    items: {
        listPagedIterator: jest.fn(async function* () {
            for (const item of datoItems) {
                yield Promise.resolve(item);
            }
        }),
    },

    uploads: {
        listPagedIterator: jest.fn(async function* () {
            yield Promise.resolve({ path: faker.system.filePath() })
        }),
    },
};

export const dato: Dato = {
    backups(): Promise<BackupEnvironment[]> {
        if (errors.backups) {
            throw errors.backups;
        }

        return Promise.resolve(environments.filter(isBackupEnvironment));
    },

    primaryEnvironmentId(): Promise<string> {
        if (errors.primaryEnvironmentId) {
            throw errors.primaryEnvironmentId;
        }

        return Promise.resolve(PRIMARY_ENV_ID);
    },

    forkEnvironment: jest.fn((environmentId: string, forkId: BackupEnvironmentId): Promise<Environment> => {
        if (errors.forkEnvironment) {
            throw errors.forkEnvironment;
        }

        return Promise.resolve(backup());
    }),

    deleteEnvironmentById: jest.fn(async (environmentId: BackupEnvironmentId): Promise<BackupEnvironment> => {
        return await client.environments.destroy(environmentId);
    }),

    dataDump: jest.fn(async (): Promise<string> => {
        if (errors.dataDump) {
            throw errors.dataDump;
        }

        return Promise.resolve(dataDump);
    }),

    assetURIs: jest.fn(async (): Promise<Array<string>> => {
        return assetURIs;
    }),
};
