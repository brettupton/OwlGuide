declare global {
    type DBRow = {
        [field: string]: string | number | null
    }

    type Config = {
        [key: string]: string
    }

    type JSONParse =
        string | number | boolean | {
            [x: string]: JSONParse
        } | JSONParse[]

}

export { }