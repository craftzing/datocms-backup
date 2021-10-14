import * as faker from 'faker';
import { DateTime } from 'luxon';
import { BackupEnvironment, BackupEnvironmentId, Dato, Environment } from './dato';

let environments: Environment[] = [];

function fakeEnvironments(...envs: Environment[]) {
    environments = environments.concat(envs);

    return this;
}

export function fakeMainEnvironment(): Environment {
    const env = {
        id: 'main',
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

export const fakeSiteClient = {
    environments: {
        all(): Promise<Environment[]> {
            return new Promise((resolve) => resolve(environments));
        },

        fork: jest.fn((environmentId: string, { id }: { id: BackupEnvironmentId }): Promise<Environment> => {
            const fork = fakeSandboxEnvironment(id);

            return new Promise((resolve) => resolve(fork));
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

            return new Promise((resolve) => resolve(deletedEnvironment));
        }),
    },
};
