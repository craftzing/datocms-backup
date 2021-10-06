#!/usr/bin/env node
import { Kernel, createKernel } from './kernel';
import * as Create from './commands/create';
import * as Cleanup from './commands/cleanup';

const kernel: Kernel = createKernel(
    Create.COMMAND,
    Cleanup.COMMAND,
);

kernel.boot();
