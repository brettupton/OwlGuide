export type DBRow = {
    [field: string]: string | number | null
}

export type Table = {
    [table: string]: {
        "TableName": string
        "TableHeaders": {
            [header: string]: {
                type: string
                insert: boolean
                csvRef: string | string[]
                foreignKey?: {
                    references: string
                    onDelete: string
                    onUpdate: string
                }
            }
        }
        "CSVHeaders": string[]
        "Indexes": string[]
    }
}