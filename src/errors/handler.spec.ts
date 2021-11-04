import { handle } from './handler';
import { output } from '../output.fake';
import { Misconfiguration } from './misconfiguration';

describe('error handler', () => {
    it('can handle misconfiguration errors', async () => {
        const message = 'Whoops...';

        await handle(() => {
            throw new Misconfiguration(message);
        }, output);

        expect(output.misconfig).toHaveBeenCalledWith(message);
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
