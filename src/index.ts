#!/usr/bin/env node
import { config } from 'dotenv';
import { Kernel, createKernel } from './kernel';
import * as Create from './commands/create';
import * as Cleanup from './commands/cleanup';

config();

const kernel: Kernel = createKernel(
    Create,
    Cleanup,
);

kernel.boot();
