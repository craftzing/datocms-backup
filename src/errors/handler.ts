import { Output } from '../output';
import { Misconfiguration } from './misconfiguration';

export async function handle(process: Function, output: Output): Promise<void> {
    try {
        return await process();
    } catch (error) {
        if (error instanceof Misconfiguration) {
            output.misconfig(error.message);

            return;
        }

        throw error;
    }
}
