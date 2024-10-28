import { Database, OPEN_READONLY } from "sqlite3"
import path from 'path'

type dbRow = {
    [field: string]: string | number | null
}

const dbPath = path.join(__dirname, '..', 'main', 'db', 'owlguide.db')

const getTablePage = (name: string, offset: number, limit: number): Promise<{ rows: dbRow[], total: number }> => {
    return new Promise((resolve, reject) => {
        const db = new Database(dbPath, OPEN_READONLY, (err) => {
            if (err) {
                reject(err)
            }
        })

        let total = 0
        db.serialize(() => {
            db.get(`SELECT COUNT(ID) FROM ${name}`, (err, result) => {
                if (err) {
                    reject(err)
                }
                total = result["COUNT(ID)"]
            })
            db.all(`SELECT * FROM ${name} LIMIT ?,?`, [(offset * limit), limit], (err, rows: dbRow[]) => {
                if (err) {
                    reject(err)
                }
                resolve({ rows, total })
            })
        })
        db.close((err) => {
            if (err) {
                reject(err)
            }
        })
    })
}

const getAllTermList = (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(dbPath, OPEN_READONLY, (err) => {
            if (err) {
                reject(err)
            }
        })

        db.all(`SELECT DISTINCT CONCAT(Term, Year) AS Term FROM Courses ORDER BY Term, Year`, (err, rows: dbRow[]) => {
            if (err) {
                reject(err)
            }
            const terms: string[] = []
            rows.forEach((row) => {
                terms.push(row.Term as string)
            })
            resolve(terms)
        })

        db.close((err) => {
            if (err) {
                reject(err)
            }
        })
    })
}

const getAllPrevSalesByBook = (term: string, year: string, isbn: string, title: string): Promise<dbRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(dbPath, OPEN_READONLY, (err) => {
            if (err) reject(err)
        })

        // Return EstEnrl, ActEnrl, and TotalSales for previous terms based on ISBN or Title and term
        db.all(`SELECT CONCAT(Sales.Term, Sales.Year) AS Term, Books.ISBN, Books.Title,
                    SUM(Courses.EstEnrl) AS EstEnrl,
                    SUM(Courses.ActEnrl) AS ActEnrl,
                    Sales.UsedSales + Sales.NewSales AS Sales
                FROM Courses
                JOIN Course_Book ON Course_Book.CourseID = Courses.ID
                JOIN Books ON Course_Book.BookID = Books.ID
                JOIN Sales ON Books.ID = Sales.BookID
                    AND Sales.Term = Courses.Term
                    AND Sales.Year = Courses.Year
                WHERE Books.ISBN = ?1 AND Books.Title = ?2
                    AND Courses.Term = ?3 
                    AND Courses.Year != ?4
                    AND Courses.Dept NOT IN ("SPEC", "CANC")
                GROUP BY Sales.Year
                ORDER BY Sales.Term;`,
            [isbn, title, term, year], (err, rows: dbRow[]) => {
                if (err) reject(err)

                resolve(rows)
            })
    })
}

const getPrevSalesByBookArr = (term: string, year: string, books: (string | number)[][]): Promise<dbRow[]> => {
    return new Promise((resolve, reject) => {
        const db = new Database(dbPath, OPEN_READONLY, (err) => {
            if (err) reject(err)
        })

        const rows: dbRow[] = []
        const stmt =
            db.prepare(`SELECT Books.ISBN, Books.Title,
                            SUM(CASE WHEN Courses.Term = ?3 AND Courses.Year != ?4 THEN Courses.EstEnrl ELSE NULL END) AS PrevEstEnrl,
                            SUM(CASE WHEN Courses.Term = ?3 AND Courses.Year != ?4 THEN Courses.ActEnrl ELSE NULL END) AS PrevActEnrl,
                            SUM(CASE WHEN Courses.Term = ?3 AND Courses.Year = ?4 THEN Courses.EstEnrl ELSE 0 END) AS CurrEstEnrl,
                            SUM(CASE WHEN Courses.Term = ?3 AND Courses.Year = ?4 THEN Courses.ActEnrl ELSE 0 END) AS CurrActEnrl,
                            COALESCE((
                                SELECT SUM(Sales.UsedSales + Sales.NewSales)
                                FROM Sales
                                JOIN Books ON Sales.BookID = Books.ID
                                WHERE Sales.Term = ?3 
                                    AND Sales.Year != ?4
                                    AND Books.ISBN = ?1
                                    AND Books.Title = ?2
                            ), NULL) AS TotalSales
                        FROM Books
                        JOIN Course_Book ON Course_Book.BookID = Books.ID
                        JOIN Courses ON Course_Book.CourseID = Courses.ID
                        JOIN Sales ON Books.ID = Sales.BookID
                            AND Sales.Term = Courses.Term
                            AND Sales.Year = Courses.Year
                        WHERE Books.ISBN = ?1 AND Books.Title = ?2
                            AND Courses.Term = ?3 
                            AND Courses.Dept NOT IN ("SPEC", "CANC")
                        GROUP BY Books.ISBN;`)

        for (const [isbn, title, decision] of books) {
            stmt.each([isbn, title, term, year], (err, row: dbRow) => {
                if (err) reject(err)

                if (decision !== null) {
                    row["Decision"] = decision
                }
                rows.push(row)
            })
        }

        stmt.finalize((err) => {
            if (err) {
                reject(`Error finalizing statement: ${err.message}`)
            }
        })

        db.close((err) => {
            if (err) reject(`Error closing database: ${err.message}`)

            resolve(rows)
        })
    })
}

const getPrevSalesData = (term: string, year: string): Promise<dbRow[]> => {
    return new Promise(async (resolve, reject) => {
        const db = new Database(dbPath, OPEN_READONLY, (err) => {
            if (err) {
                reject(err)
            }
        })
        db.all(`SELECT Books.ID AS BookID, Books.ISBN, Books.Title,
                    -- Sum enrollments for specified term and year
                    SUM(CASE WHEN Courses.Term = ?1 AND Courses.Year = ?2 THEN Courses.EstEnrl ELSE 0 END) AS CurrEstEnrl,
                    SUM(CASE WHEN Courses.Term = ?1 AND Courses.Year = ?2 THEN Courses.ActEnrl ELSE 0 END) AS CurrActEnrl,
                    SUM(CASE WHEN Sales.Term = ?1 AND Sales.Year = ?2 THEN Sales.EstSales ELSE 0 END) AS CurrEstSales,
                    -- Average enrollments and sales for historical data
                    ROUND(AVG(CASE WHEN Courses.Term = ?1 AND Courses.Year != ?2 THEN Courses.EstEnrl ELSE NULL END), 0) AS PrevEstEnrl,
                    ROUND(AVG(CASE WHEN Courses.Term = ?1 AND Courses.Year != ?2 THEN Courses.ActEnrl ELSE NULL END), 0) AS PrevActEnrl,
                    ROUND(AVG(CASE WHEN Sales.Term = ?1 AND Sales.Year != ?2 THEN Sales.UsedSales + Sales.NewSales ELSE NULL END)) AS PrevSales
                FROM Books
                JOIN Course_Book ON Course_Book.BookID = Books.ID
                JOIN Courses ON Course_Book.CourseID = Courses.ID
                JOIN Sales ON Books.ID = Sales.BookID
                    AND Sales.Term = Courses.Term
                    AND Sales.Year = Courses.Year
                -- Subquery to limit results to books from the specified term and year
                WHERE Books.ID IN (
                    SELECT DISTINCT Books.ID
                    FROM Books
                    JOIN Course_Book ON Course_Book.BookID = Books.ID
                    JOIN Courses ON Course_Book.CourseID = Courses.ID
                    WHERE Courses.Term = ?1 
                        AND Courses.Year = ?2
                        AND Courses.Dept NOT IN ("SPEC", "CANC")
                )
                GROUP BY Books.ID, Books.ISBN, Books.Title
                ORDER BY Books.Title;`,
            [term, year], (err, rows: dbRow[]) => {
                if (err) {
                    reject(err)
                }
                resolve(rows)
            })

        db.close((err) => {
            if (err) {
                reject(err)
            }
        })
    })
}

export const sqlDB = { getTablePage, getPrevSalesData, getPrevSalesByBookArr, getAllPrevSalesByBook }