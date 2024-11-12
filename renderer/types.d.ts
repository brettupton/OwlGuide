declare global {
    type DBRow = {
        [field: string]: string | number | null
    }

    type Config = {
        [key: string]: string
    }
}

export { }