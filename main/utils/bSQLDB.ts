import Database from "better-sqlite3"
import fs from 'fs'
import tables from "../db/tables"
import { regex, paths, fileManager } from "./"
import { SQLHeader } from "../../types/Database"

const createDB = async (): Promise<void[]> => {
    if (fs.existsSync(paths.dbPath)) {
        await fileManager.files.delete(paths.dbPath)
    }

    return await Promise.all(
        Object.keys(tables).map((tableName): Promise<void> => {
            return new Promise((resolve, reject) => {
                const db = new Database(paths.dbPath)
                const table = tables[tableName as keyof typeof tables]
                const sqlHeader = table["SQLHeaders"]
                const tableSchema = buildTableSchema(sqlHeader, table["CompKey"], false)

                db.prepare(`DROP TABLE IF EXISTS ${tableName}`).run()
                db.prepare(`CREATE TABLE IF NOT EXISTS ${tableName} ${tableSchema}`).run()

                try {
                    db.transaction(() => {
                        table["Indexes"].forEach(index => {
                            const indexStmt = `CREATE INDEX IF NOT EXISTS idx_${tableName.toLowerCase()}_${index.split(", ").join("_").toLowerCase()} ON ${tableName}(${index})`
                            db.prepare(indexStmt).run()
                        })
                    })()

                    if (tableName === "Books") {
                        db.prepare(`INSERT INTO Books (ID) VALUES (0)`).run()
                    }

                    db.close()
                    resolve()
                } catch (error) {
                    console.error("Error creating indexes:", error)
                    db.close()
                    reject(error)
                }
            })
        }))
}

const buildTableSchema = (sqlHeader: SQLHeader, compKey: string[], update: boolean) => {
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

    return `(${columns}${!update && foreignKeys ? `, ${foreignKeys}` : ""}${!update && compKey.length > 0 ? `, PRIMARY KEY (${compKey.join(", ")})` : ""})`
        .replace(/,\s*$/, "")
}

const buildInsertStmt = (tableName: string, sqlHeader: SQLHeader, compKey: string[], temp: boolean) => {
    const insertKeys = Object.keys(sqlHeader)
    const placeholders = insertKeys.map(() => "?").join(", ")
    const conflictKeys = compKey.length > 0
        ? insertKeys.filter(key => !compKey.includes(key))
        : insertKeys.filter(key => key !== "ID")
    const placeholderID = 0

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
        if ((["Sales", "Course_Book", "Prices", "Inventory"].includes(tableName)) && key === "BookID") {
            return resolveForeignKey("BookID", "Books")
        }
        return `temp_${tableName}.${key}`
    }).join(", ")

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
                ON CONFLICT(${sqlHeader["ID"] ? "ID" : compKey.join(", ")}) 
                DO ${conflictKeys.length > 0
                ? `UPDATE SET ${conflictKeys.map((key) => `${key} = excluded.${key}`).join(", ")}`
                : `NOTHING`}`
        }`
}

const updateDB = async (files: string[]) => {
    const db = new Database(paths.dbPath)
    for (const tableName of Object.keys(tables)) {
        await new Promise<void>(async (resolve, reject) => {
            const table = tables[tableName as keyof typeof tables]
            const sqlHeader: SQLHeader = table["SQLHeaders"]
            const tableSchema = buildTableSchema(sqlHeader, table["CompKey"], true)

            db.prepare(`DROP TABLE IF EXISTS temp_${tableName}`).run()
            db.prepare(`CREATE TEMP TABLE temp_${tableName} ${tableSchema}`).run()

            const insertTemp = db.prepare(buildInsertStmt(tableName, sqlHeader, table["CompKey"], true))
            const upsertStmt = db.prepare(buildInsertStmt(tableName, sqlHeader, table["CompKey"], false))

            const filePath = files.find((file) => file.includes(table["CSVName"]))

            try {
                const csv = await fileManager.csv.read(filePath)
                db.transaction(() => {
                    for (const row of csv) {
                        try {
                            const values = mapCSVHeader(table["SQLHeaders"], table["CSVHeaders"], row)
                            insertTemp.run(values)
                        } catch (error) {
                            console.error(`Error row:`, row)
                            console.error(`Error details:`, error)
                            throw error
                        }
                    }
                })()

                upsertStmt.run()
                resolve()
            } catch (error) {
                db.close()
                reject(error)
            }
        })
    }
    db.close()
}

const mapCSVHeader = (sqlHeader: SQLHeader, csvHeader: string[], row: { [field: string]: string | number }) => {
    const values = Object.keys(sqlHeader).map(key => {
        const csvRefIndex = Array.isArray(sqlHeader[key].csvRef)
            ? sqlHeader[key]["csvRef"].map((ref) => csvHeader.findIndex((header) => header === ref))
            : csvHeader.findIndex((header) => header === sqlHeader[key].csvRef)
        return Array.isArray(csvRefIndex) ? csvRefIndex.map(index => row[index] || "").join("") : row[csvRefIndex]
    })

    return values
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
                Sales.Term, Sales.Year, Sales.TotalEstEnrl, Sales.TotalActEnrl, Sales.TotalEstSales, Sales.UsedSales, Sales.NewSales, Sales.Reorders
                FROM Books
                JOIN Sales ON Books.ID = Sales.BookID
                AND ISBN LIKE ?
                AND Sales.Term NOT IN ('I', 'Q')
                ORDER BY Sales.Year DESC, Sales.Term`)

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
    all: { createDB, updateDB, getAllTerms, getTablePage },
    sales: { getPrevSalesByTerm, getPrevSalesByBook },
    books: { getBooksByTerm, getBooksByCourse, getBookByISBN },
    courses: { getCoursesByBook, getCoursesByTerm, getSectionsByTerm }
}