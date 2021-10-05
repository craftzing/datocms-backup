#!/usr/bin/env node
import { Kernel, createKernel } from './kernel';

const kernel: Kernel = createKernel();

kernel.boot();
