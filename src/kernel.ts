import * as Commander from 'commander';
import { Command, ArgumentDefinition, OptionDefinition, Arguments, Options } from './command';
import { createOutput, Output } from './output';

export type Kernel = {
    readonly boot: () => void
}

export function createKernel(...commands: Command[]): Kernel {
    const cli: Commander.Command = new Commander.Command();

    commands.forEach(registerCommand);

    function registerCommand(command: Command) {
        const cmd = cli.command(command.name);
        const argumentDefinitions = command.arguments ?? [];
        const optionDefinitions = command.options ?? [];

        argumentDefinitions.forEach((argument: ArgumentDefinition): void => registerCommandArgument(cmd, argument));
        optionDefinitions.forEach((option: OptionDefinition): void => registerCommandOption(cmd, option));
        cmd.action((...input: any[]) => mapInputToCommandHandler(command, ...input));
    }

    function registerCommandArgument(cmd: Commander.Command, argument: ArgumentDefinition): void {
        const arg = cmd.createArgument(argument.name, argument.description);

        if (argument.hasOwnProperty('choices')) {
            arg.choices(argument.choices);
        }

        if (argument.hasOwnProperty('defaultValue')) {
            arg.argOptional().default(argument.defaultValue);
        }

        cmd.addArgument(arg);
    }

    function registerCommandOption(cmd: Commander.Command, option: OptionDefinition): void {
        let flags = `--${option.flag}`;

        if (option.hasOwnProperty('shortFlag')) {
            flags = `-${option.shortFlag}, ${flags}`;
        }

        cmd.option(flags, option.description, option.defaultValue || undefined);
    }

    function mapInputToCommandHandler(command: Command, ...input: any[]): Promise<void> {
        const argumentDefinitions = command.arguments ?? [];
        const args = argumentDefinitions.reduce<Arguments>((
            args: Arguments,
            arg: ArgumentDefinition,
            position: number,
        ): Arguments => {
            args[arg.name] = input[position];

            return args;
        }, {});
        const opts: Options = input[Object.keys(args).length];
        const output: Output = createOutput(opts);

        return command.handle(args, opts, output);
    }

    function boot(): void {
        cli.parse(process.argv);
    }

    return {
        boot,
    };
}
