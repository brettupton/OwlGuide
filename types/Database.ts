export type SQLHeader = {
    [header: string]: {
        type: string
        csvRef: string | string[]
        foreignKey?: {
            references: string
            onDelete: string
            onUpdate: string
        }
    }
}

export type Table = {
    [table: string]: {
        "CSVName": string
        "SQLHeaders": SQLHeader
        "CSVHeaders": string[]
        "CompKey": string[]
        "Indexes": string[]
    }
}