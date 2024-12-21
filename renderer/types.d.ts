declare global {
    type DBRow = {
        [field: string]: string | number | null
    }

    type Config = {
        [key: string]: string
    }

    type JSONish =
        | string
        | number
        | boolean
        | { [key: string]: JSONish }
        | JSONish[]

    type ProcessArgs = {
        event?: Electron.IpcMainEvent
        process?: string
        method: string
        data: JSONish
    }

}

export { }