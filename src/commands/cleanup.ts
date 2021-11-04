import { Arguments, Command, Options } from '../command';
import { Output } from '../output';
import * as OlderThan from './cleanup/olderThan';

export const name: string = 'cleanup';

export async function handle(args: Arguments, options: Options, output: Output): Promise<void> {
    output.help();
}

export const subCommands: Command[] = [
    OlderThan,
];
