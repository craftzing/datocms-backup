import { output } from '../output.fake';
import { Command } from '../command';
import { COMMAND } from './cleanup';
import * as OlderThan from './cleanup/olderThan';

describe('command', () => {
    it('should have a descriptive name', () => {
        expect(COMMAND.name).toEqual('cleanup');
    });

    it('should not have arguments', () => {
        expect(COMMAND.arguments).toEqual(undefined);
    });

    it('should not have options', () => {
        expect(COMMAND.options).toEqual(undefined);
    });

    it('should have subcommands', () => {
        expect(COMMAND.subCommands).toEqual<Command[]>([
            OlderThan.COMMAND,
        ]);
    });

    it('should output help by default', async () => {
        await COMMAND.handle({}, { debug: false }, output);

        expect(output.help).toHaveBeenCalledTimes(1);
    });
});
