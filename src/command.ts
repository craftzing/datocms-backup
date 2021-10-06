import { Output } from './output';

export type Command = {
    readonly name: string
    readonly arguments?: ArgumentDefinition[]
    readonly options?: OptionDefinition[]
    readonly handle: Handler
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
    readonly defaultValue?: string | boolean
}

export type Options = {
    [name: string]: boolean
}

export type Handler = (args: Arguments, options: Options, output: Output) => Promise<void>;
