import * as faker from 'faker';
import { DateTime } from 'luxon';
import { Dato, BackupEnvironment, BackupEnvironmentId, Environment } from './dato';

beforeEach(() => {
    jest.clearAllMocks();
    reset();
});

const PRIMARY_ENV_ID = 'main';
let environments: Environment[] = [];
let errors: {
    [name: string]: Error | undefined
} = {};

function reset(): void {
    environments = [];
    errors = {
        primaryEnvironmentId: undefined,
        forkEnvironment: undefined,
    };
}

export function fakeErrorWhileResolvingPrimaryId(): void {
    errors.primaryEnvironmentId = new Error('Faked missing primary environment.');
}

export function fakeErrorWhileCreatingBackup(): void {
    errors.forkEnvironment = new Error('Faked an error while creating a backup.');
}

function fakeEnvironments(...envs: Environment[]): void {
    environments = environments.concat(envs);
}

export function fakePrimaryEnvironment(): Environment {
    const env = {
        id: PRIMARY_ENV_ID,
        meta: {
            primary: true,
            createdAt: faker.date.past(),
        },
    };

    fakeEnvironments(env);

    return env;
}

export function fakeBackup(): BackupEnvironment {
    const isoBackupDate = faker.date.past();
    const backupDate = DateTime.fromISO(faker.date.past()).toFormat('yyyy-LL-dd');
    const backupId: BackupEnvironmentId = `backup-${backupDate}`;
    const env = {
        id: backupId,
        meta: {
            primary: false,
            createdAt: isoBackupDate,
        },
    };

    fakeEnvironments(env);

    return env;
}

export function fakeSandboxEnvironment(id?: string): Environment {
    const env = {
        id: id ?? faker.lorem.word(),
        meta: {
            primary: false,
            createdAt: faker.date.past(),
        },
    };

    fakeEnvironments(env);

    return env;
}

export const siteClient = {
    environments: {
        all(): Promise<Environment[]> {
            return Promise.resolve(environments);
        },

        fork: jest.fn((environmentId: string, { id }: { id: BackupEnvironmentId }): Promise<Environment> => {
            const fork = fakeSandboxEnvironment(id);

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
};

export const client: Dato = {
    backups(): Promise<[BackupEnvironment?]> {
        return Promise.resolve([]);
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

        const backup = fakeBackup();

        return Promise.resolve(backup);
    }),

    async deleteEnvironmentById(environmentId: BackupEnvironmentId): Promise<BackupEnvironment> {
        return await siteClient.environments.destroy(environmentId);
    },
};
