export type TableHeader = {
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

export type Table = {
    [table: string]: {
        "TableName": string
        "TableHeaders": TableHeader
        "CSVHeaders": string[]
        "Indexes": string[]
    }
}