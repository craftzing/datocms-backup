import { OptionDefinition } from '../command';

export const DEBUG: OptionDefinition = {
    flag: 'debug',
    shortFlag: 'd',
    description: 'Display debugging info',
}

export const CONFIRM: OptionDefinition = {
    flag: 'confirm',
    shortFlag: 'y',
    description: 'Bypass all confirmation prompts',
}
