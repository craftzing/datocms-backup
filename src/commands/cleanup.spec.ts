import { output } from '../output.fake';
import { Command } from '../command';
import * as Cleanup from './cleanup';
import * as OlderThan from './cleanup/olderThan';

describe('command', () => {
    it('should have a descriptive name', () => {
        expect(Cleanup.name).toEqual('cleanup');
    });

    it('should have subcommands', () => {
        expect(Cleanup.subCommands).toEqual<Command[]>([
            OlderThan,
        ]);
    });

    it('should output help by default', async () => {
        await Cleanup.handle({}, { debug: false }, output);

        expect(output.help).toHaveBeenCalledTimes(1);
    });
});
