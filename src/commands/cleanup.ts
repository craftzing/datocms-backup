import { Arguments, Command, Options } from '../command';
import { Output } from '../output';
import * as OlderThan from './cleanup/olderThan';

export const COMMAND: Command = {
    name: 'cleanup',
    async handle(args: Arguments, options: Options, output: Output): Promise<void> {
        output.completed('Yas');
    },
    subCommands: [
        OlderThan.COMMAND,
    ],
}
