import Database from "better-sqlite3"
import fs from 'fs'
import Papa from 'papaparse'
import path from 'path'
import tables from "../db/tables"
import { regex } from "./regex"
import { TableHeader, DBRow } from "../../types/Database"

const dbPath = path.join(__dirname, '..', 'main', 'db', 'owlguide-2.db')

const buildTableSchema = (sqlHeader: TableHeader, newTable: boolean) => {
    const columns = Object.entries(sqlHeader)
        .map(([key, { type }]) => `${key} ${type}`)
        .join(", ")
    const foreignKeys = Object.entries(sqlHeader)
        .map(([key, { foreignKey }]) => {
            return foreignKey
                ? `FOREIGN KEY (${key}) REFERENCES ${foreignKey.references}` +
                (foreignKey.onDelete ? ` ON DELETE ${foreignKey.onDelete}` : "") +
                (foreignKey.onUpdate ? ` ON UPDATE ${foreignKey.onUpdate}` : "")
                : null
        })
        .filter(Boolean)
        .join(", ")

    return `(${columns}${newTable && foreignKeys ? `, ${foreignKeys}` : ""})`
}

const createTable = (filePath: string, name: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const db = new Database(dbPath)
        const tableData = tables[name]
        const stream = fs.createReadStream(filePath)
        const sqlHeader = tableData["TableHeaders"]
        const tableSchema = buildTableSchema(sqlHeader, true)
        const insertKeys = Object.keys(sqlHeader).filter(key => sqlHeader[key].insert)
        const placeholders = insertKeys.map(() => "?").join(", ")
        let missingBookIDs: number[] = []
        const placeholderID = 0

        try {
            db.prepare(`DROP TABLE IF EXISTS ${name}`).run()
            db.prepare(`CREATE TABLE IF NOT EXISTS ${name} ${tableSchema}`).run()

            const insertIndexes = db.transaction((indexes: string[]) => {
                indexes.forEach(index => {
                    const indexStmt = `CREATE INDEX IF NOT EXISTS idx_${name.toLowerCase()}_${index.split(", ").join("_").toLowerCase()} ON ${name}(${index})`
                    db.prepare(indexStmt).run()
                })
            })

            // Insert indexes and catch errors within transaction
            try {
                insertIndexes(tableData["Indexes"])
            } catch (indexError) {
                console.error("Error creating indexes:", indexError)
                throw indexError
            }

            const insertStmt = db.prepare(`INSERT INTO ${name} (${insertKeys.join(", ")}) VALUES (${placeholders})`)

            Papa.parse(stream, {
                header: true,
                transformHeader: (header, index) => tableData["CSVHeaders"][index] || header,
                complete: (results) => {
                    let csvResults = results.data as DBRow[]

                    // Filter and de-duplicate rows in Books table
                    if (name === "Books") {
                        csvResults = csvResults.filter((obj, index) =>
                            csvResults.findIndex(book => book["TRMSUMITMG"] === obj["TRMSUMITMG"]) === index
                        )

                        // Insert placeholder row if needed
                        db.prepare(`INSERT OR IGNORE INTO Books (ID, ISBN, Title) VALUES (?, ?, ?)`).run(placeholderID, "", "")
                    }

                    const bookStmt = db.prepare(`SELECT ID FROM Books WHERE ID=?`)
                    const courseIDs = new Set(db.prepare(`SELECT ID FROM Courses`).all().map((row: DBRow) => row.ID as number))

                    const insertMany = db.transaction((csv: DBRow[]) => {
                        for (const row of csv) {
                            if (name === "Sales" || name === "Course_Book") {
                                const bookID = Number(row["ITMBKGENKE"])
                                const courseID = Number(row["CRSSEQ"])

                                // Check if bookID exists directly in Books table
                                const bookExistID = bookStmt.get(bookID) ? bookID : placeholderID
                                row["ITMBKGENKE"] = bookExistID

                                // Log for debugging if the ID was not found
                                if (bookExistID === placeholderID) {
                                    missingBookIDs.push(bookID)
                                }

                                // Check for course existence if needed
                                const courseExists = courseIDs.has(courseID) ? courseID : placeholderID
                                row["CRSSEQ"] = courseExists
                            }

                            const values = insertKeys.map(key => {
                                const csvRef = sqlHeader[key].csvRef
                                return Array.isArray(csvRef) ? csvRef.map(ref => row[ref] || "").join("") : row[csvRef]
                            })

                            insertStmt.run(values)
                        }
                    })

                    try {
                        insertMany(csvResults)
                        // Filter duplicates, sort, and create log file
                        missingBookIDs = missingBookIDs.filter((value, index) => missingBookIDs.indexOf(value) === index).sort((a, b) => a - b)
                        fs.writeFileSync(path.join(__dirname, '..', 'main', 'tmp', 'missing_ID.log'), missingBookIDs.toString(), 'utf-8')
                        db.close()
                        resolve()
                    } catch (insertError) {
                        db.close()
                        reject(`Insertion error: ${insertError}`)
                        throw insertError
                    }
                },
                error: (error) => {
                    db.close()
                    reject(`Parsing error: ${error}`)
                }
            })
        } catch (error) {
            db.close()
            reject(`Setup error: ${error}`)
        }
    })
}

const replaceTable = (filePath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const matchName = regex.matchFileName(filePath)
        const name = Object.keys(tables).find(key => tables[key].TableName === matchName)
        const db = new Database(dbPath)

        db.pragma('foreign_keys = OFF') // Disable foreign keys for batch operations

        try {
            const stream = fs.createReadStream(filePath)
            const tableData = tables[name]
            const sqlHeader = tableData["TableHeaders"]
            const tableSchema = buildTableSchema(sqlHeader, false)
            const insertKeys = Object.keys(sqlHeader).filter(key => sqlHeader[key].insert)
            const placeholders = insertKeys.map(() => "?").join(", ")

            // Create staging table if it doesn’t exist and clear any existing data
            db.prepare(`DROP TABLE IF EXISTS staging_${name}`).run()
            db.prepare(`CREATE TABLE staging_${name} ${tableSchema}`).run()

            const insertStmt = db.prepare(`INSERT OR REPLACE INTO staging_${name} (${insertKeys.join(", ")}) VALUES (${placeholders})`)

            Papa.parse(stream, {
                header: true,  // Set to true so transformHeader is effective
                transformHeader: (header, index) => tableData["CSVHeaders"][index] || header,
                complete: (results) => {
                    const csvData = results.data as DBRow[]

                    const uniqueRows = []
                    const ids = new Set()

                    // Filter to keep only unique IDs
                    csvData.forEach(row => {
                        if (row.ID && !ids.has(row.ID)) {  // Ensure ID is valid before adding
                            uniqueRows.push(row)
                            ids.add(row.ID)
                        }
                    })

                    db.transaction(() => {
                        uniqueRows.forEach(row => {
                            const values = insertKeys.map(key => {
                                const csvRef = sqlHeader[key].csvRef
                                return Array.isArray(csvRef) ? csvRef.map(ref => row[ref] || "").join("") : row[csvRef]
                            })
                            insertStmt.run(values)
                        })
                    })()

                    // Insert new rows from staging table to main table where IDs don't exist
                    const insertNewStmt = db.prepare(`
                        INSERT INTO ${name} (${insertKeys.join(", ")})
                        SELECT ${insertKeys.join(", ")} FROM staging_${name}
                        WHERE NOT EXISTS (SELECT 1 FROM ${name} WHERE ${name}.ID = staging_${name}.ID)
                    `)
                    insertNewStmt.run()

                    // Update existing rows in the main table with values from the staging table
                    const updateStmt = db.prepare(`
                        UPDATE ${name}
                        SET ${insertKeys.map(key => `${key} = (SELECT staging_${name}.${key} FROM staging_${name} WHERE ${name}.ID = staging_${name}.ID)`).join(", ")}
                        WHERE EXISTS (SELECT 1 FROM staging_${name} WHERE ${name}.ID = staging_${name}.ID)
                    `)
                    updateStmt.run()

                    db.prepare(`DROP TABLE IF EXISTS staging_${name}`).run()

                    db.close()
                    resolve()
                },
                error: (error) => {
                    db.close()
                    reject(error)
                }
            })
        } catch (error) {
            db.close()
            reject(`${name}: ${error}`)
            throw error
        }
    })
}

const getPrevSalesByTerm = (term: string, year: string): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(dbPath)

        try {
            const queryStmt = db.prepare(`
            WITH SalesSummary AS (
                SELECT 
                    BookID,
                    SUM(CASE WHEN Term = :term AND Year != :year THEN UsedSales + NewSales ELSE 0 END) AS TotalSales,
                    SUM(CASE WHEN Term = :term AND Year = :year THEN EstSales ELSE 0 END) AS CurrEstSales
                FROM 
                    Sales
                WHERE 
                    Term = :term
                GROUP BY 
                    BookID
            )
            SELECT 
                Books.ISBN, 
                Books.Title,
                SUM(CASE WHEN Courses.Term = :term AND Courses.Year != :year THEN Courses.EstEnrl ELSE NULL END) AS PrevEstEnrl,
                SUM(CASE WHEN Courses.Term = :term AND Courses.Year != :year THEN Courses.ActEnrl ELSE NULL END) AS PrevActEnrl,
                SUM(CASE WHEN Courses.Term = :term AND Courses.Year = :year THEN Courses.EstEnrl ELSE 0 END) AS CurrEstEnrl,
                SUM(CASE WHEN Courses.Term = :term AND Courses.Year = :year THEN Courses.ActEnrl ELSE 0 END) AS CurrActEnrl,
                COALESCE(SalesSummary.TotalSales, 0) AS TotalSales,
                COALESCE(SalesSummary.CurrEstSales, 0) AS CurrEstSales
            FROM 
                Courses
            JOIN 
                Course_Book ON Courses.ID = Course_Book.CourseID
            JOIN 
                Books ON Course_Book.BookID = Books.ID
            LEFT JOIN 
                SalesSummary ON SalesSummary.BookID = Books.ID
            WHERE 
                Courses.Unit = '1'
                AND Courses.Term = :term
                AND Courses.DEPT NOT IN ('SPEC', 'CANC')
            GROUP BY 
                Books.ISBN, Books.Title
            ORDER BY 
                Books.Title`)

            const results = queryStmt.all({ term, year }) as DBRow[]

            db.close()
            resolve(results)

        } catch (error) {
            db.close()
            reject(error)
            throw error
        }
    })
}

const getPrevSalesByBook = (isbn: string, title: string, term: string, year: string) => {
    return new Promise((resolve, reject) => {
        const db = new Database(dbPath)

        try {
            const queryStmt = db.prepare(`
                SELECT 
                    CONCAT(Sales.Term, Sales.Year) AS Term, 
                    Books.ISBN, 
                    Books.Title,
                    SUM(Courses.EstEnrl) AS EstEnrl,
                    SUM(Courses.ActEnrl) AS ActEnrl,
                    Sales.UsedSales + Sales.NewSales AS Sales
                FROM 
                    Courses
                JOIN 
                    Course_Book ON Course_Book.CourseID = Courses.ID
                JOIN 
                    Books ON Course_Book.BookID = Books.ID
                JOIN 
                    Sales ON Books.ID = Sales.BookID
                        AND Sales.Term = Courses.Term
                        AND Sales.Year = Courses.Year
                    WHERE Books.ISBN = ? AND Books.Title = ?
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
            throw error
        }
    })
}

const getBooksByTerm = (term: string, year: string): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(dbPath)

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
                    AND Sales.Unit = '1'
                    AND Sales.Term=:term 
                    AND Sales.Year=:year`)

            const results = queryStmt.all({ term, year }) as DBRow[]

            db.close()
            resolve(results)
        } catch (error) {
            db.close()
            reject(error)
            throw error
        }
    })
}

const getAllTerms = (): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(dbPath)

        try {
            const terms = db.prepare(`
                SELECT DISTINCT 
                    CONCAT(Term, Year) AS Term 
                FROM 
                    Courses 
                ORDER BY 
                    Term, Year`).all() as DBRow[]

            db.close()
            resolve(terms)
        } catch (error) {
            db.close()
            reject(error)
            throw error
        }
    })
}

const bSQLDB = {
    all: { replaceTable, createTable, getAllTerms },
    sales: { getPrevSalesByTerm, getPrevSalesByBook },
    books: { getBooksByTerm }
}

export default bSQLDB