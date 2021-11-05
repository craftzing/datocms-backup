#!/usr/bin/env node
import { config } from 'dotenv';
import { Kernel, createKernel } from './kernel';
import * as Create from './commands/create';
import * as Cleanup from './commands/cleanup';
import * as Dump from './commands/dump';

config();

const kernel: Kernel = createKernel(
    Create,
    Cleanup,
    Dump,
);

kernel.boot();
