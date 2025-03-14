import Database from "better-sqlite3"
import tables from "../db/tables"
import { config, paths, fileHandler } from "./"
import { TableData, TableName } from "../../types/Database"
import { NoAdoption } from "../../types/Adoption"

const createDB = async (startTime: number): Promise<void[]> => {
    return await Promise.all(
        Object.keys(tables).map((tableName): Promise<void> => {
            return new Promise((resolve, reject) => {
                const db = new Database(paths.dbPath)
                const table = tables[tableName as TableName]
                const tableSchema = buildTableSchema(table, false)

                db.prepare(`DROP TABLE IF EXISTS ${tableName}`).run()
                db.prepare(`CREATE TABLE IF NOT EXISTS ${tableName} ${tableSchema}`).run()

                try {
                    db.transaction(() => {
                        table["Indexes"].forEach(index => {
                            const indexStmt = `CREATE INDEX IF NOT EXISTS idx_${tableName.toLowerCase()}_${index.split(", ").join("_").toLowerCase()} ON ${tableName}(${index})`
                            db.prepare(indexStmt).run()
                        })
                    })()

                    // Placeholder ID for missing Book and Order IDs in foreign tables
                    if (tableName === "Books" || tableName === "Orders") {
                        db.prepare(`INSERT INTO ${tableName} (ID) VALUES (0)`).run()
                    }

                    db.close()
                    console.log(`${tableName} Updated in ${(Date.now() - startTime) / 1000}s`)
                    resolve()
                } catch (error) {
                    console.error("Error creating indexes:", error)
                    db.close()
                    reject(error)
                }
            })
        }))
}

const buildTableSchema = (table: TableData, isSync: boolean) => {
    const compKey = table["CompKey"]
    // Map each column key with its associated type
    const columns = Object.entries(table["Columns"])
        .map(([key, { type }]) => `${key} ${type}`)
        .join(", ")
    // Map foreign keys with its references & onDelete and onUpdate properties
    const foreignKeys = Object.entries(table["Columns"])
        .map(([key, { foreignKey }]) => {
            return foreignKey
                ? `FOREIGN KEY (${key}) REFERENCES ${foreignKey.references}` +
                (foreignKey.onDelete ? ` ON DELETE ${foreignKey.onDelete}` : "") +
                (foreignKey.onUpdate ? ` ON UPDATE ${foreignKey.onUpdate}` : "")
                : null
        })
        .filter(Boolean)
        .join(", ")

    // Syncing table doesn't require including foreign or primary keys
    return `(${columns}${!isSync && foreignKeys ? `, ${foreignKeys}` : ""}${!isSync && compKey.length > 0 ? `, PRIMARY KEY (${compKey.join(", ")})` : ""})`
        .replace(/,\s*$/, "")
}

const buildInsertStmt = (tableName: TableName, temp: boolean) => {
    const columns = tables[tableName]["Columns"]
    const compKey = tables[tableName]["CompKey"]

    // Create insert keys and respective placeholders for values 
    const insertKeys = Object.keys(columns)
    const placeholders = insertKeys.map(() => "?").join(", ")

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
        if ((["Sales", "Course_Book", "Prices", "Inventory", "Order_Book"].includes(tableName)) && key === "BookID") {
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
    let lastUpdate = await config.read('dbUpdateTime', false)

    // If column reference is an array, concat elements together
    const columns = Object.entries(table.Columns)
        .map(([colName, colData]) => Array.isArray(colData.bncRef) ? `CONCAT(${colData.bncRef.join(', ')}) AS ${colName}` : colData.bncRef)
        .join(', ')

    let statement = `SELECT ${columns} FROM T2DB00622.${table.BNCName}`

    if (table.Timestamp?.length) {
        // Handle special case for tables that use a date instead of a timestamp, will always be array of length 1
        if (table.Timestamp.length < 2) {
            // Format date to 'YYYYMMDD' format
            lastUpdate = lastUpdate.substring(0, lastUpdate.lastIndexOf('-')).replace(/-/g, '')

            statement += ` WHERE ${table.Timestamp[0]} >= '${lastUpdate}'`
        } else {
            // Check timestamp array and create query conditions based on columns
            // Secondary condition selects where both timestamp values are default
            const conditions = table.Timestamp
                .map((col, index) => `${index > 0 ? 'OR ' : ''}${col} >= TIMESTAMP('${lastUpdate}')`)
                .join(' ')

            const secondaryCond = table.Timestamp
                .map((col, index) => `${index > 0 ? 'AND ' : ''}${col} >= TIMESTAMP('0001-01-01 00:00:00.000000')`)
                .join(' ')

            statement += ` WHERE ${conditions} OR (${secondaryCond})`

        }
    }

    return statement
}

const updateDB = async (files: string[], startTime: number) => {
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

            try {
                const csv = await fileHandler.csv.read(filePath)
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
                console.log(`${tableName} Updated in ${(Date.now() - startTime) / 1000}s`)
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
                    PrevSales.PrevEstEnrl, PrevSales.PrevActEnrl, PrevSales.PrevEstSales, 
                    (PrevSales.UsedSales + PrevSales.NewSales) AS PrevTotalSales,
                    MAX(Sales.EstEnrl) AS CurrEstEnrl,
                    MAX(Sales.ActEnrl) AS CurrActEnrl,
                    MAX(Sales.EstSales) AS CurrEstSales
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
    pivotCourse: { Dept: string, Course: string, Section: string }): Promise<{ queryResult: DBRow[], totalRows: number }> => {
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

            const transaction = db.transaction(() => {
                const queryResult = queryStmt.all({ term, year, dept: pivotCourse.Dept, course: pivotCourse.Course, section: pivotCourse.Section, limit }) as DBRow[]
                const countResult = countStmt.get(term, year) as DBRow

                resolve({ queryResult, totalRows: countResult.Count as number })
            })

            transaction()
            db.close()
        } catch (error) {
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
                SELECT 
                    C.Term, C.Year, C.Prof, C.NoText, 
                    GROUP_CONCAT(Books.Title, ',') AS Book, GROUP_CONCAT(Books.ISBN, ',') AS ISBN FROM Courses AS C
                LEFT JOIN 
                    Course_Book ON C.ID = Course_Book.CourseID
                LEFT JOIN 
                    Books ON Course_Book.BookID = Books.ID
                WHERE C.Year != ?
                    AND C.Dept = ?
                    AND C.Course = ?
                    AND C.Section = ?
                GROUP BY C.Term, C.Year
                ORDER BY C.Year DESC
                LIMIT 2
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
    all: { createDB, updateDB, buildSelectStmt, getAllTerms, getAllVendors },
    sales: { getPrevSalesByTerm, getPrevSalesByBook },
    books: { getBooksByCourse, getBookByISBN },
    courses: { getCoursesByBook, getCoursesByTerm, getSectionsByTerm },
    orders: { getOrdersByTerm, getOrdersByPOVendor, getOrderByID },
    reports: { libr: getLibraryReport, recon: getReconReport },
    adoptions: { getNoAdoptionsByTerm, getPrevAdoptionsByCourse }
}