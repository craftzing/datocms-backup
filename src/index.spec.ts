import { runCommand } from '../.jest/commandHelpers';

describe('cli', () => {
    it('should display help info by default', async () => {
        const { exitCode, errorOutput } = await runCommand('bin/index.js');

        // Note that we're expecting the command to exit with code 1 as we didn't
        // provide a command here. The help info should be written to stderr...
        expect(exitCode).toEqual(1);
        expect(errorOutput).toEqual(expect.stringContaining('Usage: index [options] [command]'));
        expect(errorOutput).toEqual(expect.stringContaining('Options:'));
    });

    it('should provide a create command', async () => {
        const { exitCode, output } = await runCommand('bin/index.js', 'create', '--help');

        expect(exitCode).toEqual(0);
        expect(output).toEqual(expect.stringContaining('create [options] [environmentId]'));
        expect(output).toEqual(expect.stringContaining('-d, --debug'));
        expect(output).toEqual(expect.stringContaining('-h, --help'));
    });

    it('should provide a cleanup command', async () => {
        const { exitCode, output } = await runCommand('bin/index.js', 'cleanup');

        // Note that we're expecting the command to exit with code 1 as we didn't
        // provide a subcommand here. The help info should be written to stderr...
        expect(exitCode).toEqual(1);
        expect(output).toEqual(expect.stringContaining('cleanup [options] [command]'));
        expect(output).toEqual(expect.stringContaining('-h, --help'));
        expect(output).toEqual(expect.stringContaining('Commands:'));
        expect(output).toEqual(expect.stringContaining('older-than'));
    });

    it('should provide a cleanup older-than command', async () => {
        const { exitCode, output } = await runCommand('bin/index.js', 'cleanup', 'older-than', '--help');

        expect(exitCode).toEqual(0);
        expect(output).toEqual(expect.stringContaining('cleanup older-than [options] <age>'));
        expect(output).toEqual(expect.stringContaining('Arguments:'));
        expect(output).toEqual(expect.stringContaining('age'));
        expect(output).toEqual(expect.stringContaining('-d, --debug'));
        expect(output).toEqual(expect.stringContaining('-h, --help'));
    });
});
