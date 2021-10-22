import { Output } from '../../src/output';

export function expectOutputToBeCompleted(output: Output): void {
    expect(output.completed).toHaveBeenCalledTimes(1);
    expect(output.completed).toHaveBeenCalledWith(
        expect.stringContaining('Cleanup completed'),
    );
}

export function expectOutputToBeCanceled(output: Output): void {
    expect(output.completed).toHaveBeenCalledTimes(1);
    expect(output.completed).toHaveBeenCalledWith(
        expect.stringContaining('Cleanup canceled'),
    );
}
