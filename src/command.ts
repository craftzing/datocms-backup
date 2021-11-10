import { Output } from './output';

export type Command = {
    readonly name: string
    readonly args?: ArgumentDefinition[]
    readonly options?: OptionDefinition[]
    readonly subCommands?: Command[]
    handle(args: Arguments, options: Options, output: Output): Promise<void>
}

export type ArgumentDefinition = {
    readonly name: string
    readonly description: string
    readonly choices?: string[]
    readonly defaultValue?: any
}

export type Arguments = {
    [name: string]: string
}

export type OptionDefinition = {
    readonly flag: string
    readonly shortFlag?: string
    readonly description: string
    readonly choices?: string[]
    readonly defaultValue?: string | boolean
}

export type Options = {
    [name: string]: boolean | string
    debug: boolean
}
