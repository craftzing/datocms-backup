export type Command = {
    readonly name: string
    readonly arguments: [Argument]
    readonly handle: Handler
}

export type Argument = {
    readonly name: string
    readonly description: string
    readonly defaultValue?: any
}

export type Handler = (args: any) => Promise<void>;
