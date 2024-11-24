import Database from "better-sqlite3"
import fs from 'fs'
import Papa from 'papaparse'
import path from 'path'
import tables from "../db/tables"
import paths from '../utils/paths'
import { regex } from "./regex"
import { TableHeader } from "../../types/Database"

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

const createTable = (filePath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)
        try {
            const matchName = regex.matchFileName(filePath)
            const name = Object.keys(tables).find(key => tables[key].TableName === matchName)
            const tableData = tables[name]
            const stream = fs.createReadStream(filePath)
            const sqlHeader = tableData["TableHeaders"]
            const tableSchema = buildTableSchema(sqlHeader, true)
            const insertKeys = Object.keys(sqlHeader).filter(key => sqlHeader[key].insert)
            const placeholders = insertKeys.map(() => "?").join(", ")
            let missingBookIDs: number[] = []
            const placeholderID = 0

            db.prepare(`DROP TABLE IF EXISTS ${name}`).run()
            db.prepare(`CREATE TABLE IF NOT EXISTS ${name} ${tableSchema}`).run()

            const insertIndexes = db.transaction((indexes: string[]) => {
                indexes.forEach(index => {
                    const indexStmt = `CREATE INDEX IF NOT EXISTS idx_${name.toLowerCase()}_${index.split(", ").join("_").toLowerCase()} ON ${name}(${index})`
                    db.prepare(indexStmt).run()
                })
            })

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

                    if (name === "Books" || name === "Courses") {
                        // Books and Courses have missing IDs from original CSV, a placeholder is used to keep data in reference table
                        const placeholderValues = new Array(insertKeys.length - 1).fill("")
                        placeholderValues.unshift(placeholderID)

                        insertStmt.run(placeholderValues)
                    }

                    const insertMany = db.transaction((csv: DBRow[]) => {
                        for (const row of csv) {
                            if (name === "Sales" || name === "Course_Book") {
                                const bookStmt = db.prepare(`SELECT ID FROM Books WHERE ID=?`)
                                const courseStmt = db.prepare(`SELECT ID FROM Courses WHERE ID=?`)

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
                                const courseExistId = courseStmt.get(courseID) ? courseID : placeholderID
                                row["CRSSEQ"] = courseExistId
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
                        fs.writeFileSync(path.join(paths.logPath, 'missing_ID.log'), missingBookIDs.toString(), 'utf-8')
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
        const db = new Database(paths.dbPath)

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
        const db = new Database(paths.dbPath)

        try {
            const queryStmt = db.prepare(`
                SELECT 
                    Sales.BookID, Books.ISBN, Books.Title,
                    SUM(CASE WHEN Sales.Year != :year THEN Sales.TotalEstEnrl ELSE 0 END) AS PrevEstEnrl,
                    SUM(CASE WHEN Sales.Year != :year THEN Sales.TotalActEnrl ELSE 0 END) AS PrevActEnrl,
                    SUM(CASE WHEN Sales.Year != :year THEN Sales.UsedSales + Sales.NewSales ELSE 0 END) AS PrevTotalSales,
                    MAX(CASE WHEN Sales.Year = :year THEN Sales.TotalEstEnrl ELSE NULL END) AS CurrEstEnrl,
                    MAX(CASE WHEN Sales.Year = :year THEN Sales.TotalActEnrl ELSE NULL END) AS CurrActEnrl,
                    MAX(CASE WHEN Sales.Year = :year THEN Sales.TotalEstSales ELSE NULL END) AS CurrEstSales
                FROM 
                    Sales
                JOIN 
                    Books on Sales.BookID = Books.ID
                WHERE Sales.Unit = '1'
                    AND Sales.BookID != '0'
                    AND Sales.Term = :term
                GROUP BY Sales.BookID`)

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
        const db = new Database(paths.dbPath)

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
            throw error
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
                    AND Sales.Unit = '1'
                    AND Sales.Term=:term 
                    AND Sales.Year=:year`)

            const results = queryStmt.all({ term, year }) as DBRow[]

            db.close()
            resolve(results)
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

const getBookByISBN = (ISBN: string): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const queryStmt = db.prepare(`
                SELECT Books.ID, Books.ISBN, Books.Title, Books.Author, Books.Edition, Books.Publisher,
                Courses.Term, Courses.Year
                FROM Books
                JOIN Course_Book ON Books.ID = Course_Book.BookID
                JOIN Courses ON Course_Book.CourseID = Courses.ID
                WHERE ISBN LIKE ?
                AND Courses.Term NOT IN ('I', 'Q')
                ORDER BY Courses.Term`)

            const result = queryStmt.all('%' + ISBN + '%') as DBRow[]
            db.close()
            resolve(result)
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

const getBooksByCourse = (courseID: number): Promise<{ booksResult: DBRow[], course: string }> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const booksStmt = db.prepare(`
                SELECT 
                    Books.ISBN, Books.Title, Books.Edition, Books.Author, Books.Publisher
                FROM 
                    Books
                JOIN 
                    Course_Book ON Books.ID = Course_Book.BookID
                JOIN 
                    Courses ON Course_Book.CourseID = Courses.ID
                WHERE 
                    Courses.ID = ?
                `)

            const courseStmt = db.prepare(`
                SELECT 
                    CONCAT(Courses.Dept, ' ', 
                        SUBSTR(CONCAT('000', Courses.Course), LENGTH(CONCAT('000', Courses.Course))-3+1, 3), ' ', 
                        SUBSTR(CONCAT('000', Courses.Section), LENGTH(CONCAT('000', Courses.Section))-3+1, 3)) AS Course
                FROM
                    Courses
                WHERE
                    Courses.ID = ?
                `)

            const booksResult = booksStmt.all(courseID) as DBRow[]
            const courseResult = courseStmt.get(courseID) as DBRow

            db.close()
            resolve({ booksResult, course: courseResult.Course as string })
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

const getCoursesByBook = (isbn: string, title: string, term: string, year: string): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const queryStmt = db.prepare(`
                SELECT 
                    CONCAT(Courses.Dept, ' ', 
                        SUBSTR(CONCAT('000', Courses.Course), LENGTH(CONCAT('000', Courses.Course))-3+1, 3), ' ', 
                        SUBSTR(CONCAT('000', Courses.Section), LENGTH(CONCAT('000', Courses.Section))-3+1, 3)) AS Course, 
                    Courses.EstEnrl, Courses.ActEnrl 
                FROM 
                    Courses 
                JOIN 
                    Course_Book ON Courses.ID = Course_Book.CourseID
                JOIN 
                    Books on Course_Book.BookID = Books.ID
                WHERE Books.ISBN = ?
                    AND Books.Title = ?
                    AND Courses.Term = ?
                    AND Courses.Year = ?
                ORDER BY 
                    Courses.Dept, Courses.Course, Courses.Section`)

            const results = queryStmt.all(isbn, title, term, year) as DBRow[]

            db.close()
            resolve(results)
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

const getCoursesByTerm = (term: string, year: string, limit?: number, lastCourse?: { ID: number, Dept: string, Course: string, Section: string }): Promise<{ queryResult: DBRow[], totalRowCount: number }> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        // Base query
        let coursesQuery = `
            SELECT 
                Courses.ID, Courses.Dept, 
                SUBSTR(CONCAT('000', Courses.Course), LENGTH(CONCAT('000', Courses.Course))-3+1, 3) AS Course, 
                SUBSTR(CONCAT('000', Courses.Section), LENGTH(CONCAT('000', Courses.Section))-3+1, 3) AS Section, 
                Courses.Title,
                Courses.Prof,
                Courses.EstEnrl,
                Courses.ActEnrl, 
                Courses.CRN, 
                Courses.NoText,
                CASE 
                    WHEN EXISTS (SELECT 1 FROM Course_Book WHERE Course_Book.CourseID = Courses.ID) THEN 'Y'
                    ELSE 'N'
                END AS Adoptions
            FROM 
                Courses
            WHERE Courses.Term = ?
                AND Courses.Year = ?
        `

        // Only add `Courses.Unit = '1'` and greater than condition if `limit` and `lastCourse` are present
        const params: (string | number)[] = [term, year]
        if (lastCourse !== undefined) {
            coursesQuery += ` AND Courses.Unit = '1'`
            coursesQuery += ` AND (Courses.Dept, Courses.Course, Courses.Section, Courses.ID) > (?, ?, ?, ?)`
            coursesQuery += ` ORDER BY Courses.Dept, Courses.Course, Courses.Section, Courses.ID`
            params.push(lastCourse.Dept, lastCourse.Course, lastCourse.Section, lastCourse.ID)

            if (limit !== undefined) {
                coursesQuery += ` LIMIT ?`
                params.push(limit)
            }
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

            const transaction = db.transaction(() => {
                const queryResult = queryStmt.all(...params) as DBRow[]
                const countResult = countStmt.get(term, year) as DBRow

                resolve({ queryResult, totalRowCount: countResult.Count as number })
            })

            transaction()
        } catch (error) {
            reject(error)
        } finally {
            db.close()
        }
    })
}

const getSectionsByTerm = (term: string, year: string): Promise<DBRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const queryStmt = db.prepare(`
                SELECT SUBSTR(CONCAT('000', Courses.Section), LENGTH(CONCAT('000', Courses.Section))-3+1, 3) AS Section,
                Courses.CRN
                FROM Courses
                WHERE Term = ?
                AND Year = ?
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
                    Term != ''
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

const getTablePage = (name: string, offset: number, limit: number): Promise<{ queryResult: DBRow[], totalRowCount: number }> => {
    return new Promise((resolve, reject) => {
        const db = new Database(paths.dbPath)

        try {
            const queryStmt = db.prepare(`
                SELECT 
                    * 
                FROM 
                    ${name}
                LIMIT ?, ?
                `)

            const countStmt = db.prepare(`
                SELECT
                    COUNT(*) AS Count 
                FROM 
                    ${name}
                `)

            const queryResult = queryStmt.all(offset * limit, limit) as DBRow[]
            const countResult = countStmt.get() as DBRow

            db.close()
            resolve({ queryResult, totalRowCount: countResult.Count as number })
        } catch (error) {
            db.close()
            reject(error)
        }
    })
}

export const bSQLDB = {
    all: { replaceTable, createTable, getAllTerms, getTablePage },
    sales: { getPrevSalesByTerm, getPrevSalesByBook },
    books: { getBooksByTerm, getBooksByCourse, getBookByISBN },
    courses: { getCoursesByBook, getCoursesByTerm, getSectionsByTerm }
}