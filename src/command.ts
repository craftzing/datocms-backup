export type Command = {
    readonly name: string
    readonly arguments: [Argument]
    readonly handle: CommandHandler
}

export type Argument = {
    readonly name: string
    readonly description: string
    readonly defaultValue?: any
}

export type CommandHandler = (args: any) => void;
