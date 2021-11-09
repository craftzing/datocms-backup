import '../.jest/matchers/output';
import { createOutput } from './output';

beforeEach(() => {
    jest.clearAllMocks();
});

describe('output', () => {
    const helpText = 'Some help info...';
    const output = createOutput({ helpText });

    it('can write misconfig errors to stderr', async () => {
        const message = 'CLI is misconfigured';

        const outputProcess = () => output.misconfig(message);

        await expect(outputProcess).toWriteToStdErr(`error: ${message}`);
        await expect(outputProcess).toExitWithCode(1);
    });

    it('can write a line to stdout', async () => {
        const message = 'Some info...';

        const outputProcess = () => output.line(message);

        await expect(outputProcess).toWriteToStdOut(message);
    });

    it('can write a completion message to stdout', async () => {
        const message = 'Completed something!';

        const outputProcess = () => output.completed(message);

        await expect(outputProcess).toWriteToStdOut(`\x1b[32m✨ ${message}\x1b[0m`);
        await expect(outputProcess).toExitWithCode(0);
    });

    it('can write an error message to stderr', async () => {
        const message = 'Something went wrong...';

        const outputProcess = () => output.error(message);

        await expect(outputProcess).toWriteToStdErr(`\x1b[31m🧨 ${message}\x1b[0m`);
        await expect(outputProcess).toExitWithCode(1);
    });

    it('can write a warning message to stderr', async () => {
        const message = 'Something went wrong...';

        const outputProcess = () => output.warn(message);

        await expect(outputProcess).toWriteToStdErr(`\x1b[33m⚠️ ${message}\x1b[0m`);
        await expect(outputProcess).toExitWithCode(0);
    });

    it('does not write debug messages to stdout when debugging is not explicitly enabled', async () => {
        const message = 'Some debugging info...';

        const outputProcess = () => output.debug(message);

        await expect(outputProcess).not.toWriteToStdOut('[debug]');
    });

    it('does not write debug messages to stdout when debugging is disabled', async () => {
        const output = createOutput({
            debug: false,
            helpText: 'Some help info...',
        });
        const message = 'Some debugging info...';

        const outputProcess = () => output.debug(message);

        await expect(outputProcess).not.toWriteToStdOut('[debug]');
    });

    it('can write a debug message to stdout when debugging is enables', async () => {
        const output = createOutput({
            debug: true,
            helpText: 'Some help info...',
        });
        const message = 'Some debugging info...';

        const outputProcess = () => output.debug(message);

        await expect(outputProcess).toWriteToStdOut(`\x1b[35m[debug]\x1b[0m ${message}`);
    });

    it('can write a help text to stdout', async () => {
        const outputProcess = () => output.help();

        await expect(outputProcess).toWriteToStdOut(helpText);
        await expect(outputProcess).toExitWithCode(1);
    });
});
