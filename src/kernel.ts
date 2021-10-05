import * as Commander from 'commander';
import { Command, ArgumentDefinition, OptionDefinition, Arguments, Options } from './command';

export type Kernel = {
    readonly boot: () => void
}

export function createKernel(...commands: [Command]): Kernel {
    const cli: Commander.Command = new Commander.Command();

    commands.forEach(registerCommand);

    function registerCommand(command: Command) {
        const cmd = cli.command(command.name);

        command.arguments.forEach((argument: ArgumentDefinition): void => registerCommandArgument(cmd, argument));
        command.options.forEach((option: OptionDefinition): void => registerCommandOption(cmd, option));
        cmd.action((...input: any[]) => mapInputToCommandHandler(command, ...input));
    }

    function registerCommandArgument(cmd: Commander.Command, argument: ArgumentDefinition): void {
        const arg = cmd.createArgument(argument.name, argument.description);

        if (argument.hasOwnProperty('defaultValue')) {
            arg.argOptional().default(argument.defaultValue);
        }

        cmd.addArgument(arg);
    }

    function registerCommandOption(cmd: Commander.Command, option: OptionDefinition): void {
        const flags = `-${option.shortFlag}, --${option.flag}`;

        cmd.option(flags, option.description);
    }

    function mapInputToCommandHandler(command: Command, ...input: any[]): Promise<void> {
        const args = command.arguments.reduce<Arguments>((
            args: Arguments,
            arg: ArgumentDefinition,
            position: number,
        ): Arguments => {
            args[arg.name] = input[position];

            return args;
        }, {});
        const opts: Options = input[Object.keys(args).length];

        return command.handle(args, opts);
    }

    function boot(): void {
        cli.parse(process.argv);
    }

    return {
        boot,
    };
}
