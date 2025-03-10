<<<<<<< HEAD
export type TableName = "Books" | "Courses" | "Sales" | "Course_Book" | "Prices" | "Inventory"

export type Column = {
    [column: string]: {
        type: string
=======
export type TableName = "Books" | "Courses" | "Sales" | "Course_Book" | "Prices" | "Inventory" | "Orders" | "Order_Book"

export type Column = {
    [column: string]: {
        type: "TEXT" | "INTEGER" | "INTEGER PRIMARY KEY"
>>>>>>> main
        bncRef: string | string[]
        foreignKey?: {
            references: string
            onDelete: string
            onUpdate: string
        }
    }
}

export type TableData = {
    "BNCName": string
    "Columns": Column
    "CSVHeaders": string[]
    // Composite key for identifying differences in table sync for tables that don't have identifiable primary key
    "CompKey": string[]
    "Indexes": string[]
    "Timestamp"?: string[]
}

export type Tables = {
    [name in TableName]: TableData
}