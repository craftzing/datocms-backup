import { Output } from '../output';
import { MisconfigurationError } from './misconfigurationError';
import { RuntimeError } from './runtimeError';

export async function handle(process: Function, output: Output): Promise<void> {
    try {
        return await process();
    } catch (error) {
        if (error instanceof MisconfigurationError) {
            output.misconfig(error.message);

            return;
        }

        if (error instanceof RuntimeError) {
            output.error(error.message);

            return;
        }

        throw error;
    }
}
