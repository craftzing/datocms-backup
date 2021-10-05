#!/usr/bin/env node
import { Kernel, createKernel } from './kernel';
import * as Create from './commands/create';

const kernel: Kernel = createKernel(
    Create.COMMAND,
);

kernel.boot();
