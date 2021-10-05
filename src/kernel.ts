import * as Commander from 'commander';
import { Command, Argument } from './command';

export type Kernel = {
    readonly boot: () => void
}

export function createKernel(...commands: [Command]): Kernel {
    const cli: Commander.Command = new Commander.Command();

    commands.forEach(registerCommand);

    function registerCommand(command: Command) {
        const cmd = cli.createCommand(command.name);

        command.arguments.forEach((argument: Argument): void => registerCommandArgument(cmd, argument));
        cmd.action(command.handle);

        cli.addCommand(cmd);
    }

    function registerCommandArgument(cmd: Commander.Command, argument: Argument): void {
        const arg = cmd.createArgument(argument.name);

        if (argument.hasOwnProperty('defaultValue')) {
            arg.argOptional().default(argument.defaultValue);
        }

        cmd.addArgument(arg);
    }

    function boot(): void {
        cli.parse(process.argv);
    }

    return {
        boot,
    };
}
