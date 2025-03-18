import Database from "better-sqlite3"
import tables from "../db/tables"
<<<<<<< HEAD
<<<<<<< HEAD
import { regex, paths, fileManager } from "./"
import { TableData, TableName } from "../../types/Database"

const createDB = async (): Promise<void[]> => {
=======
import { config, paths, fileHandler } from "./"
import { TableData, TableName } from "../../types/Database"
import { NoAdoption } from "../../types/Adoption"

const createDB = async (startTime: number): Promise<void[]> => {
>>>>>>> main
=======
import { config, paths, fileHandler } from "./"
import { TableData, TableName } from "../../types/Database"
import { NoAdoption } from "../../types/Adoption"
import { CourseData } from "../../types/Course"

const placeholderID = 0
const placeholderTables = ["Books", "Courses", "Orders"]

const createDB = async (startTime: number): Promise<void[]> => {
>>>>>>> main
    return await Promise.all(
        Object.keys(tables).map((tableName): Promise<void> => {
            return new Promise((resolve, reject) => {
                const db = new Database(paths.dbPath)
                const table = tables[tableName as TableName]
<<<<<<< HEAD
                const tableSchema = buildTableSchema(table, false)

                db.prepare(`DROP TABLE IF EXISTS ${tableName}`).run()
=======
                const tableSchema = buildTableSchema(table)

                db.prepare(`DROP TABLE IF EXISTS ${tableName}`).run()
                db.prepare(`VACUUM`).run()
>>>>>>> main
                db.prepare(`CREATE TABLE IF NOT EXISTS ${tableName} ${tableSchema}`).run()

                try {
                    db.transaction(() => {
                        table["Indexes"].forEach(index => {
                            const indexStmt = `CREATE INDEX IF NOT EXISTS idx_${tableName.toLowerCase()}_${index.split(", ").join("_").toLowerCase()} ON ${tableName}(${index})`
                            db.prepare(indexStmt).run()
                        })
                    })()

<<<<<<< HEAD
<<<<<<< HEAD
                    // Placeholder ID for missing Book IDs in foreign tables
                    if (tableName === "Books") {
                        db.prepare(`INSERT INTO Books (ID) VALUES (0)`).run()
                    }

                    db.close()
=======
                    // Placeholder ID for missing Book and Order IDs in foreign tables
                    if (tableName === "Books" || tableName === "Orders") {
                        db.prepare(`INSERT INTO ${tableName} (ID) VALUES (0)`).run()
=======
                    // Placeholder ID for missing IDs in foreign tables
                    if (placeholderTables.includes(tableName)) {
                        db.prepare(`INSERT INTO ${tableName} (ID) VALUES (${placeholderID})`).run()
>>>>>>> main
                    }

                    db.close()
                    console.log(`${tableName} Updated in ${(Date.now() - startTime) / 1000}s`)
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
                    resolve()
                } catch (error) {
                    console.error("Error creating indexes:", error)
                    db.close()
                    reject(error)
                }
            })
        }))
}

<<<<<<< HEAD
const buildTableSchema = (table: TableData, isSync: boolean) => {
=======
const buildTableSchema = (table: TableData) => {
>>>>>>> main
    const compKey = table["CompKey"]
    // Map each column key with its associated type
    const columns = Object.entries(table["Columns"])
        .map(([key, { type }]) => `${key} ${type}`)
        .join(", ")
    // Map foreign keys with its references & onDelete and onUpdate properties
    const foreignKeys = Object.entries(table["Columns"])
        .map(([key, { foreignKey }]) => {
            return foreignKey
                ? `FOREIGN KEY (${key}) REFERENCES ${foreignKey.references[0]}(${foreignKey.references[1]})` +
                (foreignKey.onDelete ? ` ON DELETE ${foreignKey.onDelete}` : "") +
                (foreignKey.onUpdate ? ` ON UPDATE ${foreignKey.onUpdate}` : "")
                : null
        })
        .filter(Boolean)
        .join(", ")

<<<<<<< HEAD
    // Syncing table doesn't require including foreign or primary keys
    return `(${columns}${!isSync && foreignKeys ? `, ${foreignKeys}` : ""}${!isSync && compKey.length > 0 ? `, PRIMARY KEY (${compKey.join(", ")})` : ""})`
        .replace(/,\s*$/, "")
}

const buildInsertStmt = (tableName: TableName, temp: boolean) => {
    const columns = tables[tableName]["Columns"]
    const compKey = tables[tableName]["CompKey"]
=======
    const schemaParts = [`(${columns}`]
    // Include both foreign keys and composite keys in schema
    if (foreignKeys) schemaParts.push(foreignKeys)
    if (compKey.length > 0) schemaParts.push(`PRIMARY KEY (${compKey.join(", ")})`)

    return schemaParts.join(", ") + ")"
}

const buildInsertStmt = (tableName: TableName) => {
    const columns = tables[tableName]["Columns"]
>>>>>>> main

    // Create insert keys and respective placeholders for values 
    const insertKeys = Object.keys(columns)
    const placeholders = insertKeys.map(() => "?").join(", ")

<<<<<<< HEAD
    // Retrieve insert keys that aren't composite key
    const conflictKeys = compKey.length > 0
        ? insertKeys.filter(key => !compKey.includes(key))
        : insertKeys.filter(key => key !== "ID")
    const placeholderID = 0

    // Check for foreign key existence in refTable, resolving to placeholderID if it doesn't exist
    const resolveForeignKey = (key: string, refTable: string): string => `
        CASE 
            WHEN EXISTS (SELECT 1 FROM ${refTable} WHERE ID = temp_${tableName}.${key}) 
            THEN temp_${tableName}.${key} 
            ELSE ${placeholderID} 
        END`

    // Construct SELECT fields with foreign key checks
    const selectFields = insertKeys.map(key => {
        if (tableName === "Course_Book" && key === "CourseID") {
            return resolveForeignKey("CourseID", "Courses")
        }
<<<<<<< HEAD
        if ((["Sales", "Course_Book", "Prices", "Inventory"].includes(tableName)) && key === "BookID") {
=======
        if ((["Sales", "Course_Book", "Prices", "Inventory", "Order_Book"].includes(tableName)) && key === "BookID") {
>>>>>>> main
            return resolveForeignKey("BookID", "Books")
        }
        return `temp_${tableName}.${key}`
    }).join(", ")

    // If not temp table, select all values from temporary table and handle conflicts
    return `
        INSERT INTO ${temp ? "temp_" : ""}${tableName} (${insertKeys.join(", ")}) 
        ${temp
            ? `VALUES (${placeholders})`
            : `SELECT ${selectFields}
                FROM temp_${tableName}
                WHERE ${tableName === "Course_Book"
                ? `CourseID IN (SELECT ID FROM Courses) AND BookID IN (SELECT ID FROM Books)`
                : tableName === "Sales"
                    ? `BookID IN (SELECT ID FROM Books)`
                    : "true"}
                ON CONFLICT(${columns["ID"] ? "ID" : compKey.join(", ")}) 
                DO ${conflictKeys.length > 0
                ? `UPDATE SET ${conflictKeys.map((key) => `${key} = excluded.${key}`).join(", ")}`
                : `NOTHING`}`
        }`
}

const buildSelectStmt = async (table: TableData) => {
<<<<<<< HEAD
    let lastUpdate = await fileManager.config.read('dbUpdateTime', false)
=======
    let lastUpdate = await config.read('dbUpdateTime', false)
>>>>>>> main

    // If column reference is an array, concat elements together
    const columns = Object.entries(table.Columns)
        .map(([colName, colData]) => Array.isArray(colData.bncRef) ? `CONCAT(${colData.bncRef.join(', ')}) AS ${colName}` : colData.bncRef)
        .join(', ')

    let statement = `SELECT ${columns} FROM T2DB00622.${table.BNCName}`

    if (table.Timestamp?.length) {
<<<<<<< HEAD
        // Handle special case for ADP006 table, which uses a date instead of a timestamp
        if (table.BNCName === 'ADP006') {
=======
        // Handle special case for tables that use a date instead of a timestamp, will always be array of length 1
        if (table.Timestamp.length < 2) {
>>>>>>> main
            // Format date to 'YYYYMMDD' format
            lastUpdate = lastUpdate.substring(0, lastUpdate.lastIndexOf('-')).replace(/-/g, '')

            statement += ` WHERE ${table.Timestamp[0]} >= '${lastUpdate}'`
        } else {
<<<<<<< HEAD
=======
            // Check timestamp array and create query conditions based on columns
            // Secondary condition selects where both timestamp values are default
>>>>>>> main
            const conditions = table.Timestamp
                .map((col, index) => `${index > 0 ? 'OR ' : ''}${col} >= TIMESTAMP('${lastUpdate}')`)
                .join(' ')

<<<<<<< HEAD
            statement += ` WHERE ${conditions}`
=======
            const secondaryCond = table.Timestamp
                .map((col, index) => `${index > 0 ? 'AND ' : ''}${col} >= TIMESTAMP('0001-01-01 00:00:00.000000')`)
                .join(' ')

            statement += ` WHERE ${conditions} OR (${secondaryCond})`

>>>>>>> main
        }
    }

    return statement
}

<<<<<<< HEAD
const updateDB = async (files: string[]) => {
=======
const updateDB = async (files: string[], startTime: number) => {
>>>>>>> main
    const db = new Database(paths.dbPath)
    for (const tableName of Object.keys(tables) as TableName[]) {
        await new Promise<void>(async (resolve, reject) => {
            const table = tables[tableName]
            const tableSchema = buildTableSchema(table, true)

            db.prepare(`DROP TABLE IF EXISTS temp_${tableName}`).run()
            db.prepare(`CREATE TEMP TABLE temp_${tableName} ${tableSchema}`).run()

            const insertTemp = db.prepare(buildInsertStmt(tableName, true))
            const upsertStmt = db.prepare(buildInsertStmt(tableName, false))

            const filePath = files.find((file) => file.includes(tableName))
=======
    // Ignore duplicate entries to satisfy unique constraint
    return `INSERT OR IGNORE INTO ${tableName} (${insertKeys.join(", ")}) VALUES (${placeholders})`
}
>>>>>>> main

const buildSelectStmt = async (table: TableData) => {
    const termYear = await config.read('updateYear')

    // If column reference is an array, concat elements together
    const columns = Object.entries(table.Columns)
        .map(([colName, colData]) => Array.isArray(colData.bncRef) ? `CONCAT(${colData.bncRef.join(', ')}) AS ${colName}` : colData.bncRef)
        .join(', ')

    let statement = `SELECT ${columns} FROM T2DB00622.${table.BNCName}`

    if (table.Timestamp) {
        statement += ` WHERE ${table.Timestamp} >= '${termYear}'`
    }

    return statement
}

const syncDB = async (files: string[], startTime: number) => {
    const db = new Database(paths.dbPath)
    for (const tableName of Object.keys(tables) as TableName[]) {
        await new Promise<void>(async (resolve, reject) => {
            // Disable foreign key restraints, delete all rows from table, and vacuum database 
            db.prepare(`PRAGMA foreign_keys = OFF`).run()
            db.prepare(`DELETE FROM ${tableName}${placeholderTables.includes(tableName) ? ` WHERE ID > 0` : ''}`).run()
            db.prepare(`PRAGMA foreign_keys = ON`).run()
            db.prepare(`VACUUM`).run()

            const insertStmt = db.prepare(buildInsertStmt(tableName))

            const filePath = files.find((file) => file.includes(tableName))
            try {
<<<<<<< HEAD
<<<<<<< HEAD
                const csv = await fileManager.csv.read(filePath)
=======
                const csv = await fileHandler.csv.read(filePath)
>>>>>>> main
                db.transaction(() => {
                    for (const row of csv) {
                        try {
                            insertTemp.run(row)
                        } catch (error) {
                            console.error(`Error row:`, row)
                            console.error(`Error details:`, error)
                            throw error
                        }
                    }
                })()

                upsertStmt.run()
<<<<<<< HEAD
=======
                console.log(`${tableName} Updated in ${(Date.now() - startTime) / 1000}s`)
>>>>>>> main
=======
                const csv = await fileHandler.csv.read(filePath)
                db.transaction(() => {
                    const columnNames = Object.keys(tables[tableName]["Columns"])
                    const columnIndexMap = columnNames.reduce((acc, colName, idx) => {
                        acc[colName] = idx
                        return acc
                    }, {} as { [field: string]: number })

                    csv.forEach((row, index) => {
                        try {
                            const foreignKeys = Object.entries(tables[tableName]["Columns"]).filter(([_, colData]) => colData.foreignKey)

                            // Resolve foreign keys to placeholder if not found in referenced table
                            if (foreignKeys.length > 0) {
                                for (const [keyName, keyData] of foreignKeys) {
                                    const [refTable, refKey] = keyData["foreignKey"]["references"]
                                    const colIndex = columnIndexMap[keyName]

                                    // Check if row[keyName] exists in referenced table
                                    const keyCheck = db.prepare(`
                                        SELECT EXISTS(SELECT 1 FROM ${refTable} WHERE ${refKey} = ?) AS refExists
                                    `).get(row[colIndex]) as DBRow

                                    // Debug
                                    if (0) {
                                        console.log("Index Map:", columnIndexMap)
                                        console.log("Key Name:", keyName, ";Key Data:", keyData)
                                        console.log("Ref Table:", refTable, ";Ref Key:", refKey)
                                        console.log("Index:", colIndex)
                                        console.log("Key Check:", keyCheck)
                                    }

                                    // If the referenced key does not exist, replace with placeholderID
                                    if (!keyCheck.refExists) {
                                        row[colIndex] = placeholderID
                                    }
                                }
                            }
                            insertStmt.run(row)
                        } catch (error) {
                            console.error(`Error Table: ${tableName}\nError Row: ${index}`, row)
                            db.prepare(`ROLLBACK`).run()
                            throw error
                        }
                    }
                    )
                })()

                console.log(`${tableName} Synced in ${(Date.now() - startTime) / 1000}s`)
>>>>>>> main
                resolve()
            } catch (error) {
                db.close()
                reject(error)
            }
        })
    }
    db.close()
}

const getPrevSalesByTerm = (term: string, year: string): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const queryStmt = db.prepare(`
<<<<<<< HEAD
                WITH PrevTwoTerms AS (
                    -- Get the last two distinct years
                    SELECT DISTINCT Sales.Year
                    FROM Sales
                    WHERE Sales.Term = :term AND Sales.Year < :year
                    ORDER BY Sales.Year DESC
                    LIMIT 2
                ),
                PrevSales AS (
                    SELECT 
                        Sales.BookID AS BookID, 
                        SUM(Sales.EstEnrl) AS PrevEstEnrl, 
                        SUM(Sales.ActEnrl) AS PrevActEnrl, 
                        SUM(Sales.EstSales) AS PrevEstSales,
                        SUM(Sales.UsedSales) AS UsedSales, 
                        SUM(Sales.NewSales) AS NewSales
                FROM Sales
                WHERE Sales.Term = :term
                AND Sales.Year IN (SELECT Year FROM PrevTwoTerms) -- Only previous two terms
                GROUP BY Sales.BookID
                )
                SELECT 
                    Sales.BookID, Books.ISBN, Books.Title,
<<<<<<< HEAD
                    SUM(CASE WHEN Sales.Year != :year THEN Sales.EstEnrl ELSE 0 END) AS PrevEstEnrl,
                    SUM(CASE WHEN Sales.Year != :year THEN Sales.ActEnrl ELSE 0 END) AS PrevActEnrl,
                    SUM(CASE WHEN Sales.Year != :year THEN Sales.UsedSales + Sales.NewSales ELSE 0 END) AS PrevTotalSales,
                    MAX(CASE WHEN Sales.Year = :year THEN Sales.EstEnrl ELSE NULL END) AS CurrEstEnrl,
                    MAX(CASE WHEN Sales.Year = :year THEN Sales.ActEnrl ELSE NULL END) AS CurrActEnrl,
                    MAX(CASE WHEN Sales.Year = :year THEN Sales.EstSales ELSE NULL END) AS CurrEstSales
=======
                    PrevSales.PrevEstEnrl, PrevSales.PrevActEnrl, PrevSales.PrevEstSales, 
                    (PrevSales.UsedSales + PrevSales.NewSales) AS PrevTotalSales,
                    MAX(Sales.EstEnrl) AS CurrEstEnrl,
                    MAX(Sales.ActEnrl) AS CurrActEnrl,
                    MAX(Sales.EstSales) AS CurrEstSales
>>>>>>> main
                FROM 
                    Sales
                JOIN 
                    Books on Sales.BookID = Books.ID
                JOIN
                    Course_Book ON Books.ID = Course_Book.BookID
                JOIN
                    Courses ON Course_Book.CourseID = Courses.ID
                LEFT JOIN
                    PrevSales ON Books.ID = PrevSales.BookID
                WHERE Sales.Unit = '1'
                    AND Sales.Term = :term
                    AND Sales.Year = :year
                    AND Courses.Dept NOT IN ('SPEC', 'CANC')
                    AND SUBSTR(Books.ISBN, 1, 3) != '822'
                    AND SUBSTR(Books.Title, 1, 3) != 'EBK'
                GROUP BY Sales.BookID`)

            const results = queryStmt.all({ term, year }) as DBRow[]

            db.close()
            resolve(results)
        } catch (error) {
            db.close()
            reject(error)
<<<<<<< HEAD
        }
    })
}

const getTermModelFeatures = (termYear: string): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)
        const [term, year] = regex.splitFullTerm(termYear)

        try {
            const queryStmt = db.prepare(`
                SELECT
                    Books.ID,
                    Books.ISBN,
                    Books.Title,
                    Sales.EstSales,
                    Sales.Term,
                    Sales.Year,
                    Books.Publisher,
                    Courses.Dept,
                    Courses.Course,
                    Sales.EstEnrl,
                    Sales.ActEnrl,
                    (Prices.UnitPrice * (1 - (CAST(Prices.Discount AS REAL) - 30) / 100)) AS Price
                FROM Sales
                JOIN Books ON Sales.BookID = Books.ID
                JOIN Prices ON Books.ID = Prices.BookID
                JOIN Course_Book ON Books.ID = Course_Book.BookID
                JOIN Courses ON Course_Book.CourseID = Courses.ID
                WHERE Sales.Term = :term
                    AND Sales.Year = :year
                    AND Sales.Unit = 1
					AND Courses.Term = Sales.Term
					AND Courses.Year = Sales.Year
                    AND Sales.NumCourses > 0
                    AND Books.Publisher NOT IN ('VST', 'XX SUPPLY')
                    AND Dept NOT IN ('CANC', 'SPEC')
                    AND Course NOT IN ('CANC', 'SPEC')
                    AND Prices.UnitPrice > 0
                GROUP BY Sales.Term, Sales.Year, Sales.BookID
                ORDER BY Sales.BookID
                `)

            const queryResult = queryStmt.all({ term, year }) as DBRow[]

            db.close()
            resolve(queryResult)
        } catch (error) {
            db.close()
            reject(error)
=======
>>>>>>> main
        }
    })
}

const getPrevSalesByBook = (bookID: number, term: string, year: string): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const queryStmt = db.prepare(`
                SELECT CONCAT(Sales.Term, Sales.Year) AS Term,
                        SUM(Sales.EstEnrl) AS EstEnrl,
                        SUM(Sales.ActEnrl) AS ActEnrl,
                        SUM(Sales.UsedSales) + SUM(Sales.NewSales) AS Sales
                FROM Sales
                JOIN Books ON Sales.BookID = Books.ID
                WHERE Books.ID = ?
                    AND CONCAT(Sales.Term, Sales.Year) != ?
                GROUP BY Sales.Term,
                            Sales.Year
                ORDER BY Sales.Year DESC`)

            const results = queryStmt.all(bookID, term + year) as DBRow[]

            db.close()
            resolve(results)
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

const getBookByISBN = (ISBN: string): Promise<{ info: DBRow[], sales: DBRow[] }> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const infoStmt = db.prepare(`
                SELECT 
                    Books.ID, Books.ISBN, Books.Title, Books.Author, Books.Edition, Books.Publisher, 
                    Prices.UnitPrice, Prices.Discount,
                    COALESCE(MAX(CASE WHEN Inventory.Unit = '1' AND Inventory.NewUsed = 'NW' THEN Inventory.OnHand ELSE 0 END), 0) AS NewOH,
                    COALESCE(MAX(CASE WHEN Inventory.Unit = '1' AND Inventory.NewUsed = 'US' THEN Inventory.OnHand ELSE 0 END), 0) AS UsedOH
                FROM 
                    Books
                JOIN 
                    Prices ON Books.ID = Prices.BookID
                LEFT JOIN 
                    Inventory ON Books.ID = Inventory.BookID
                WHERE Books.ISBN LIKE ?
                `)

            const salesStmt = db.prepare(`
                SELECT 
                    Sales.Term, Sales.Year, Sales.EstEnrl, Sales.ActEnrl, Sales.EstSales, Sales.UsedSales, Sales.NewSales, Sales.Reorders
                FROM 
                    Books
                JOIN 
                    Sales ON Books.ID = Sales.BookID
<<<<<<< HEAD
                        AND Sales.Term = Courses.Term
                        AND Sales.Year = Courses.Year
                    WHERE Books.ISBN = ? AND Books.Title = ?
                        AND Courses.Unit = '1'
                        AND Sales.Unit = '1'
                        AND Courses.Term = ? 
                        AND Courses.Year != ?
                        AND Courses.Dept NOT IN ('SPEC', 'CANC')
                GROUP BY Sales.Year
                ORDER BY Sales.Term`)

            const results = queryStmt.all(isbn, title, term, year) as DBRow[]

            db.close()
            resolve(results)
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

const getBooksByTerm = (term: string, year: string): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const queryStmt = db.prepare(`
                SELECT 
                    Books.ISBN, Books.Title 
                FROM 
                    Books 
                JOIN 
                    Sales on Books.ID = Sales.BookID
                WHERE
                    Sales.BookID != '0'
=======
                WHERE Books.ISBN LIKE ?
                    AND Sales.Term NOT IN ('I', 'Q')
>>>>>>> main
                    AND Sales.Unit = '1'
                ORDER BY Sales.Year DESC, Sales.Term
                `)
=======
                WITH PrevTwoTerms AS
                    (SELECT DISTINCT Sales.Year
                    FROM Sales
                    WHERE Sales.Term = :term
                        AND Sales.Year < :year
                    ORDER BY Sales.Year DESC
                    LIMIT 2),
                    PrevSales AS
                    (SELECT Sales.BookID AS BookID,
                    SUM(Sales.EstEnrl) AS PrevEstEnrl,
                    SUM(Sales.ActEnrl) AS PrevActEnrl,
                    SUM(Sales.EstSales) AS PrevEstSales,
                    SUM(Sales.UsedSales) AS UsedSales,
                    SUM(Sales.NewSales) AS NewSales
                    FROM Sales
                    WHERE Sales.Term = :term
                        AND Sales.Year IN
                        (SELECT YEAR
                        FROM PrevTwoTerms)
                    GROUP BY Sales.BookID)
                SELECT Books.ID AS BookID,
                    Books.ISBN,
                    Books.Title,
                    PrevSales.PrevEstEnrl,
                    PrevSales.PrevActEnrl,
                    (PrevSales.UsedSales + PrevSales.NewSales) AS PrevTotalSales,
                    SUM(Courses.EstEnrl) AS CurrEstEnrl,
                    SUM(Courses.ActEnrl) AS CurrActEnrl,
                    COALESCE(Sales.EstSales, 0) AS CurrEstSales
                FROM 'Course_Book' AS CB
                JOIN Books ON CB.BookID = Books.ID
                JOIN Courses ON CB.CourseID = Courses.ID
                LEFT JOIN PrevSales ON Books.ID = PrevSales.BookID
                LEFT JOIN Sales ON CB.BookID = Sales.BookID
                AND Sales.Term = :term
                AND Sales.Year = :year
                WHERE CB.Unit = '1'
                    AND CB.Term = :term
                    AND CB.Year = :year
                    AND Courses.Dept NOT IN ('CANC', 'SPEC')
                    AND Books.Publisher NOT IN ('VST', 'XX SUPPLY')
                GROUP BY Books.ID`)

            const results = queryStmt.all({ term, year }) as DBRow[]
>>>>>>> main

            const infoResult = infoStmt.all('%' + ISBN + '%') as DBRow[]
            const salesResult = salesStmt.all('%' + ISBN + '%') as DBRow[]
            db.close()
<<<<<<< HEAD
            resolve(results)
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

const getPrevSalesByBook = (bookID: number, term: string, year: string): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const queryStmt = db.prepare(`
<<<<<<< HEAD
                SELECT Books.ID, Books.ISBN, Books.Title, Books.Author, Books.Edition, Books.Publisher, 
                Sales.Term, Sales.Year, Sales.EstEnrl, Sales.ActEnrl, Sales.EstSales, Sales.UsedSales, Sales.NewSales, Sales.Reorders
                FROM Books
                JOIN Sales ON Books.ID = Sales.BookID
                AND ISBN LIKE ?
                AND Sales.Term NOT IN ('I', 'Q')
                AND Sales.Unit = '1'
                ORDER BY Sales.Year DESC, Sales.Term`)
=======
                SELECT CONCAT(Sales.Term, Sales.Year) AS Term,
                        SUM(Sales.EstEnrl) AS EstEnrl,
                        SUM(Sales.ActEnrl) AS ActEnrl,
                        SUM(Sales.UsedSales) + SUM(Sales.NewSales) AS Sales
                FROM Sales
                JOIN Books ON Sales.BookID = Books.ID
                WHERE Books.ID = ?
                    AND CONCAT(Sales.Term, Sales.Year) != ?
                GROUP BY Sales.Term,
                            Sales.Year
                ORDER BY Sales.Year DESC`)

            const results = queryStmt.all(bookID, term + year) as DBRow[]
>>>>>>> main

            db.close()
<<<<<<< HEAD
            resolve(result)
=======
            resolve({ info: infoResult, sales: salesResult })
>>>>>>> main
=======
            resolve(results)
>>>>>>> main
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

const getBookByISBN = (ISBN: string): Promise<{ info: DBRow[], sales: DBRow[] }> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const infoStmt = db.prepare(`
                SELECT 
                    Books.ID, Books.ISBN, Books.Title, Books.Author, Books.Edition, Books.Publisher, 
                    Prices.UnitPrice, Prices.Discount,
                    COALESCE(MAX(CASE WHEN Inventory.Unit = '1' AND Inventory.NewUsed = 'NW' THEN Inventory.OnHand ELSE 0 END), 0) AS NewOH,
                    COALESCE(MAX(CASE WHEN Inventory.Unit = '1' AND Inventory.NewUsed = 'US' THEN Inventory.OnHand ELSE 0 END), 0) AS UsedOH
                FROM 
                    Books
                JOIN 
                    Prices ON Books.ID = Prices.BookID
                LEFT JOIN 
                    Inventory ON Books.ID = Inventory.BookID
                WHERE Books.ISBN LIKE ?
                `)

            const salesStmt = db.prepare(`
                SELECT 
                    Sales.Term, Sales.Year, Sales.EstEnrl, Sales.ActEnrl, Sales.EstSales, Sales.UsedSales, Sales.NewSales, Sales.Reorders
                FROM 
                    Books
                JOIN 
                    Sales ON Books.ID = Sales.BookID
                WHERE Books.ISBN LIKE ?
                    AND Sales.Term NOT IN ('I', 'Q')
                    AND Sales.Unit = '1'
                ORDER BY Sales.Year DESC, Sales.Term
                `)

            const infoResult = infoStmt.all('%' + ISBN + '%') as DBRow[]
            const salesResult = salesStmt.all('%' + ISBN + '%') as DBRow[]
            db.close()
            resolve({ info: infoResult, sales: salesResult })
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

<<<<<<< HEAD
=======
const getBooksByCourse = (course: DBRow): Promise<{ booksResult: DBRow[] }> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        const courseID = course?.ID
        try {
            const booksStmt = db.prepare(`
                SELECT Books.ISBN,
                        Books.Title,
                        Books.Edition,
                        Books.Author,
                        Books.Publisher
                FROM Books
                JOIN Course_Book ON Books.ID = Course_Book.BookID
                JOIN Courses ON Course_Book.CourseID = Courses.ID
                WHERE Courses.ID = ?
                `)

            const booksResult = booksStmt.all(courseID) as DBRow[]

            db.close()
            resolve({ booksResult })
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

>>>>>>> main
const getCoursesByBook = (bookID: number, term: string, year: string): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const queryStmt = db.prepare(`
                SELECT 
                    CONCAT(Courses.Dept, ' ', 
                        SUBSTR(CONCAT('000', Courses.Course), LENGTH(CONCAT('000', Courses.Course))-3+1, 3), ' ', 
                        SUBSTR(CONCAT('000', Courses.Section), LENGTH(CONCAT('000', Courses.Section))-3+1, 3)) AS Course, 
                    Courses.EstEnrl, 
                    Courses.ActEnrl 
                FROM Courses 
                JOIN Course_Book ON Courses.ID = Course_Book.CourseID
                JOIN Books on Course_Book.BookID = Books.ID
                WHERE Books.ID = ?
                    AND Courses.Term = ?
                    AND Courses.Year = ?
                ORDER BY Courses.Dept, 
                            Courses.Course, 
                            Courses.Section`)

            const results = queryStmt.all(bookID, term, year) as DBRow[]

            db.close()
            resolve(results)
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

const getCoursesByTerm = (term: string, year: string, limit: number, isForward: boolean, isSearch: boolean,
<<<<<<< HEAD
    pivotCourse: { Dept: string, Course: string, Section: string }): Promise<{ queryResult: DBRow[], totalRows: number }> => {
=======
    pivotCourse: { Dept: string, Course: string, Section: string }): Promise<{ queryResult: CourseData[], totalRows: number }> => {
>>>>>>> main
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        const direction = isForward ? '>' : '<'
        const order = isForward ? '' : ' DESC'

        // 1=1 ensures condition is filled even if not provided 
        const queryCondition = isSearch ? `AND 
            (
                ${pivotCourse.Dept ? "Courses.Dept >= :dept" : "1=1"}
                AND ${pivotCourse.Course ? "Courses.Course >= :course" : "1=1"}
                AND ${pivotCourse.Section ? "Courses.Section >= :section" : "1=1"}
            )`
            :
            `AND (Courses.Dept, Courses.Course, Courses.Section) ${direction} (:dept, :course, :section)`

        let coursesQuery = `
<<<<<<< HEAD
                SELECT 
                    Courses.ID, 
                    Courses.Dept, 
                    SUBSTR('000' || Courses.Course, LENGTH('000' || Courses.Course) - 3 + 1, 3) AS Course, 
                    SUBSTR('000' || Courses.Section, LENGTH('000' || Courses.Section) - 3 + 1, 3) AS Section, 
                    Courses.Title, 
                    Courses.Prof, 
                    Courses.EstEnrl, 
                    Courses.ActEnrl, 
                    Courses.NoText, 
                    CASE 
                        WHEN EXISTS (SELECT 1 FROM Course_Book WHERE Course_Book.CourseID = Courses.ID) THEN 'Y'
                        ELSE 'N'
                    END AS Adopt
                FROM 
                    Courses
                WHERE 
                    Courses.Term = :term 
                    AND Courses.Year = :year 
                    AND Courses.Unit = '1' 
                    ${queryCondition}
                ORDER BY 
                    Courses.Dept${order}, Courses.Course${order}, Courses.Section${order}
=======
                SELECT Courses.ID,
                        Courses.Dept,
                        SUBSTR('000' || Courses.Course, LENGTH('000' || Courses.Course) - 3 + 1, 3) AS Course,
                        SUBSTR('000' || Courses.Section, LENGTH('000' || Courses.Section) - 3 + 1, 3) AS Section,
                        Courses.Title,
                        Courses.Prof,
                        Courses.EstEnrl,
                        Courses.ActEnrl,
                        Courses.NoText,
                        CASE
                            WHEN EXISTS
                                    (SELECT 1
                                    FROM Course_Book
                                    WHERE Course_Book.CourseID = Courses.ID) THEN 'Y'
                            ELSE 'N'
                        END AS Adopt
                FROM Courses
                WHERE Courses.Term = :term
                    AND Courses.Year = :year
                    AND Courses.Unit = '1' 
                    ${queryCondition}
                ORDER BY Courses.Dept${order}, 
                            Courses.Course${order}, 
                            Courses.Section${order}
>>>>>>> main
                LIMIT :limit
            `

        // Wrap in a reverse-order query if moving backward
        if (!isForward) {
            coursesQuery = `
                SELECT * FROM (${coursesQuery}) AS Courses 
                ORDER BY Courses.Dept, Courses.Course, Courses.Section
            `
        }

        try {
            const queryStmt = db.prepare(coursesQuery)
            const countStmt = db.prepare(`
                SELECT 
                    COUNT(*) AS Count
                FROM 
                    Courses
                WHERE Courses.Unit = '1'
                    AND Courses.Term = ?
                    AND Courses.Year = ?
                `)

<<<<<<< HEAD
            const transaction = db.transaction(() => {
                const queryResult = queryStmt.all({ term, year, dept: pivotCourse.Dept, course: pivotCourse.Course, section: pivotCourse.Section, limit }) as DBRow[]
                const countResult = countStmt.get(term, year) as DBRow

                resolve({ queryResult, totalRows: countResult.Count as number })
            })

            transaction()
            db.close()
        } catch (error) {
=======
            const queryResult = queryStmt.all({ term, year, dept: pivotCourse.Dept, course: pivotCourse.Course, section: pivotCourse.Section, limit }) as CourseData[]
            const countResult = countStmt.get(term, year) as DBRow

            db.close()
            resolve({ queryResult, totalRows: countResult.Count as number })
        } catch (error) {
            db.close()
>>>>>>> main
            reject(error)
        }
    })
}

const getSectionsByTerm = (term: string, year: string): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const queryStmt = db.prepare(`
                SELECT 
                    SUBSTR(CONCAT('000', Courses.Section), LENGTH(CONCAT('000', Courses.Section))-3+1, 3) AS Section,
                    Courses.CRN
                FROM 
                    Courses
                WHERE Courses.Term = ?
                    AND Courses.Year = ?
                `)

            const queryResult = queryStmt.all(term, year) as DBRow[]

            db.close()
            resolve(queryResult)
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

const getAllTerms = (): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const terms = db.prepare(`
                SELECT DISTINCT 
                    CONCAT(Term, Year) AS Term 
                FROM 
                    Courses
                WHERE 
                    Courses.Term != ''
                ORDER BY 
                    Courses.Term, Courses.Year`).all() as DBRow[]

            db.close()
            resolve(terms)
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

const getAllVendors = (): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const vendors = db.prepare(`
                SELECT DISTINCT
                    Vendor
                FROM 
                    Orders
				WHERE
					Vendor IS NOT NULL
                ORDER BY
                    Vendor
                `).all() as DBRow[]

            db.close()
            resolve(vendors)
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

const getOrdersByTerm = (term: string, year: string): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const queryStmt = db.prepare(`
                SELECT 
                    Orders.ID, Orders.Number AS PO, Orders.Vendor, Orders.CreatedOn, Orders.Status, Orders.SentBy, Orders.Sent, 
                    Orders.NumItemsOrd AS NumOrd, Orders.NumItemsRcvd AS NumRcvd, Orders.QtyItemsOrd AS QtyOrd, Orders.QtyItemsRcvd AS QtyRcvd
                FROM 
                    Orders
                WHERE Orders.Unit = '1'
                    AND Orders.Term = ?
                    AND Orders.Year = ?
                ORDER BY Orders.Number 
                `)

            const queryResult = queryStmt.all(term, year) as DBRow[]

            db.close()
            resolve(queryResult)
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

const getOrdersByPOVendor = (PO: string, vendor: string): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const queryStmt = db.prepare(`
                SELECT 
                    Orders.ID, Orders.Term, Orders.Year, Orders.Number, Orders.Vendor, Orders.Status, Orders.SentBy, Orders.Sent, 
                    Orders.NumItemsOrd AS NumOrd, Orders.NumItemsRcvd AS NumRcvd, Orders.QtyItemsOrd AS QtyOrd, Orders.QtyItemsRcvd AS QtyRcvd
                FROM 
                    Orders
                WHERE 
                    Orders.ID != '0'
                    AND Orders.Number LIKE ? AND Orders.Vendor LIKE ?
                ORDER BY 
                    Orders.Term, Orders.Year
                `)

            const queryResult = queryStmt.all('%' + PO + '%', '%' + vendor + '%') as DBRow[]

            db.close()
            resolve(queryResult)
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

const getOrderByID = (reqId: string): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const queryStmt = db.prepare(`
                SELECT 
                    Books.ISBN, Books.Title,
                    Order_Book.NewUsed AS "Cond.", Order_Book.Ordered, Order_Book.Received,
                    Order_Book.UnitPrice, Order_Book.Discount
                FROM 
                    Order_Book
                JOIN 
                    Books ON Order_Book.BookID = Books.ID
                WHERE 
                    Order_Book.OrderID = ?
                ORDER BY Books.Title
                `)

            const queryResult = queryStmt.all(reqId) as DBRow[]

            db.close()
            resolve(queryResult)
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

const getNoAdoptionsByTerm = (term: string, year: string): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const queryStmt = db.prepare(`
                SELECT Courses.ID, Courses.CRN, Courses.Dept, 
                    SUBSTR('000' || Courses.Course, LENGTH('000' || Courses.Course) - 3 + 1, 3) AS Course, 
                    SUBSTR('000' || Courses.Section, LENGTH('000' || Courses.Section) - 3 + 1, 3) AS Section, 
                    Courses.Prof, Courses.Title,
                    -- Subquery to check if Dept,Course,Section existed in prior years
                    EXISTS (
                            SELECT 1
                            FROM Courses AS C
                            WHERE C.Year != :year
                                AND C.Dept = Courses.Dept
                                AND C.Course = Courses.Course
                                AND C.Section = Courses.Section
                        ) AS HasPrev
                FROM 
                    Courses
                WHERE Courses.Unit = '1'
                    AND Courses.Term = :term
                    AND Courses.Year = :year
                    AND Courses.NoText = 'N'
                    -- Check if Course already has Book for term
                    AND NOT EXISTS(
                        SELECT 1 FROM Course_Book
                        WHERE Courses.ID = Course_Book.CourseID
                            AND Course_Book.Unit = '1'
                        AND Course_Book.Term = :term
                        AND Course_Book.Year = :year
                    )
                ORDER BY 
                    Courses.Dept, Courses.Course, Courses.Section
                `)

            const queryResult = queryStmt.all({ term, year }) as DBRow[]

            db.close()
            resolve(queryResult)
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

const getPrevAdoptionsByCourse = (year: string, course: NoAdoption): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const queryStmt = db.prepare(`
<<<<<<< HEAD
                SELECT 
                    C.Term, C.Year, C.Prof, C.NoText, 
                    GROUP_CONCAT(Books.Title, ',') AS Book, GROUP_CONCAT(Books.ISBN, ',') AS ISBN FROM Courses AS C
                LEFT JOIN 
                    Course_Book ON C.ID = Course_Book.CourseID
                LEFT JOIN 
                    Books ON Course_Book.BookID = Books.ID
=======
                SELECT C.Term,
                        C.Year,
                        C.Prof,
                        C.NoText,
                        Books.Title,
                        Books.ISBN
                FROM Courses AS C
                LEFT JOIN Course_Book ON C.ID = Course_Book.CourseID
                LEFT JOIN Books ON Course_Book.BookID = Books.ID
>>>>>>> main
                WHERE C.Year != ?
                    AND C.Dept = ?
                    AND C.Course = ?
                    AND C.Section = ?
<<<<<<< HEAD
                GROUP BY C.Term, C.Year
                ORDER BY C.Year DESC
                LIMIT 2
=======
                ORDER BY C.Year DESC
>>>>>>> main
                `)

            const queryResult = queryStmt.all(year, course["Dept"], course["Course"], course["Section"]) as DBRow[]

            db.close()
            resolve(queryResult)
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

const getLibraryReport = (term: string, year: string): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const queryStmt = db.prepare(`
                SELECT 
                    Books.Title, 
                    Books.ISBN, 
                    (CASE WHEN Course_Book.Unit = '1' THEN 'MPC' ELSE 'MCV' END) AS Str,
                    Courses.Dept, 
                    SUBSTR('000' || Courses.Course, LENGTH('000' || Courses.Course) - 3 + 1, 3) AS Course, 
                    SUBSTR('000' || Courses.Section, LENGTH('000' || Courses.Section) - 3 + 1, 3) AS Section, 
                    Courses.Prof,
                    Books.Author, 
                    Books.Edition, 
                    Books.Publisher
                FROM 
                    Course_Book
                JOIN 
                    Courses ON Course_Book.CourseID = Courses.ID
                JOIN 
                    Books ON Course_Book.BookID = Books.ID
                WHERE 
                    Course_Book.Term = ?
                        AND Course_Book.Year = ?
                        AND Courses.Dept NOT IN ('CANC', 'SPEC')
                        AND SUBSTR(Books.ISBN, 1, 3) != '822'
                        AND Books.ISBN != '0'
                        AND Books.Publisher != 'VST'
                ORDER BY Courses.Dept, Courses.Course, Courses.Section, Books.ISBN
                `)

            const queryResult = queryStmt.all(term, year) as DBRow[]

            db.close()
            resolve(queryResult)
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

const getReconReport = (term: string, year: string): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const queryStmt = db.prepare(`
                SELECT 
                    Courses.Dept,
                    SUBSTR('000' || Courses.Course, LENGTH('000' || Courses.Course) - 3 + 1, 3) AS Course, 
                    SUBSTR('000' || Courses.Section, LENGTH('000' || Courses.Section) - 3 + 1, 3) AS Section,
                    Books.Title, 
                    Books.ISBN,
                    MAX(CASE WHEN Inventory.NewUsed = 'NW' THEN Inventory.OnHand ELSE 0 END) AS NewOH,
                    MAX(CASE WHEN Inventory.NewUsed = 'NW' THEN Inventory.Reserved ELSE 0 END) AS NewRsvd,
                    MAX(CASE WHEN Inventory.NewUsed = 'US' THEN Inventory.OnHand ELSE 0 END) AS UsedOH,
                    MAX(CASE WHEN Inventory.NewUsed = 'US' THEN Inventory.Reserved ELSE 0 END) AS UsedRsvd,
                    (
                    SELECT GROUP_CONCAT(Dept || ' ' || Course, CHAR(10))
                    FROM (
                        SELECT DISTINCT C2.Dept, 
                            SUBSTR('000' || C2.Course, LENGTH('000' || C2.Course) - 3 + 1, 3) AS Course
                        FROM Course_Book CB2
                        JOIN Courses C2 ON CB2.CourseID = C2.ID
                        WHERE CB2.BookID = Course_Book.BookID
                        AND (C2.Dept <> Courses.Dept OR C2.Course <> Courses.Course)
                        AND CB2.Unit = '1' 
                        AND CB2.Term = :term 
                        AND CB2.Year = :year
                        AND C2.Dept NOT IN ('CANC', 'SPEC')
                        ORDER BY C2.Dept, C2.Course
                    )
                ) AS CXL
                FROM Course_Book
                JOIN Courses ON Course_Book.CourseID = Courses.ID
                JOIN Books ON Course_Book.BookID = Books.ID
                LEFT JOIN Inventory ON Course_Book.BookID = Inventory.BookID
                WHERE 
                    Course_Book.Unit = '1'
                    AND Course_Book.Term = :term
                    AND Course_Book.Year = :year
                    AND Courses.Dept NOT IN ('CANC', 'SPEC')
                    AND Books.Publisher NOT IN ('XX SUPPLY', 'VST')
                GROUP BY 
                    Courses.Dept, 
                    Courses.Course, 
                    Courses.Section,
                    Books.ID, 
                    Books.ISBN, 
                    Books.Title
                ORDER BY 
                    Courses.Dept, 
                    Course, 
                    Section
                `)

            const queryResult = queryStmt.all({ term, year }) as DBRow[]

            db.close()
            resolve(queryResult)
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

export const bSQLDB = {
<<<<<<< HEAD
<<<<<<< HEAD
    all: { createDB, updateDB, buildSelectStmt, getAllTerms, getTablePage },
    sales: { getPrevSalesByTerm, getPrevSalesByBook, getTermModelFeatures },
    books: { getBooksByTerm, getBooksByCourse, getBookByISBN },
    courses: { getCoursesByBook, getCoursesByTerm, getSectionsByTerm }
=======
    all: { createDB, updateDB, buildSelectStmt, getAllTerms, getAllVendors },
=======
    all: { createDB, syncDB, buildSelectStmt, getAllTerms, getAllVendors },
>>>>>>> main
    sales: { getPrevSalesByTerm, getPrevSalesByBook },
    books: { getBooksByCourse, getBookByISBN },
    courses: { getCoursesByBook, getCoursesByTerm, getSectionsByTerm },
    orders: { getOrdersByTerm, getOrdersByPOVendor, getOrderByID },
    reports: { libr: getLibraryReport, recon: getReconReport },
    adoptions: { getNoAdoptionsByTerm, getPrevAdoptionsByCourse }
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
}