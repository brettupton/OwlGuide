declare global {
    type DBRow = {
        [field: string]: string | number | null
    }

    type Config = {
        [key: string]: string
    }

    type JSObj =
        | string
        | number
        | boolean
        | { [key: string]: JSObj }
        | JSObj[]

    type ProcessArgs = {
        event?: Electron.IpcMainEvent
        process?: string
        method: string
        data: JSObj
    }

}

export { }