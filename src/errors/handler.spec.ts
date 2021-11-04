import { handle } from './handler';
import { output } from '../output.fake';
import { MisconfigurationError } from './misconfigurationError';
import { RuntimeError } from './runtimeError';

describe('error handler', () => {
    it('can handle misconfiguration errors', async () => {
        const message = 'Whoops...';

        await handle(() => {
            throw new MisconfigurationError(message);
        }, output);

        expect(output.misconfig).toHaveBeenCalledWith(message);
    });

    it('can handle runtime errors', async () => {
        const message = 'Whoops...';

        await handle(() => {
            throw new RuntimeError(message);
        }, output);

        expect(output.error).toHaveBeenCalledWith(message);
    });

    it('should rethrow errors that should not be handled', async () => {
        const unhandledError = new Error('Do not handle this one...');

        try {
            await handle(() => {
                throw unhandledError;
            }, output);
        } catch (error) {
            expect(error).toEqual(unhandledError);
        }
    });
});
