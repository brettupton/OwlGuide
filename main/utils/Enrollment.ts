import XLSX from 'xlsx'
import path from 'path'
import fs from 'fs'
import Papa from 'papaparse'
import { CSVCourse, XLSXCourse } from '../../types/Enrollment'

interface PrevFileData {
    prevCourses: CSVCourse[]
    fileName: string
}

export class EnrollmentService {
    private readonly filePath: string
    private term: string
    public fileName: string
    public enrollPath: string

    constructor(filePath: string) {
        this.filePath = filePath
        this.term = this.getFullTerm(filePath)
        this.fileName = this.getFileName(filePath)
        this.enrollPath = path.join(__dirname, '..', 'resources', 'stores', `${global.store}`, 'enrollment', `${this.term[0]}`)
    }

    private readXLSXFile(): XLSXCourse[] {
        const wb = XLSX.readFile(this.filePath)
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data: XLSXCourse[] = XLSX.utils.sheet_to_json(ws)

        return data
    }

    private getFullTerm(filePath: string) {
        const splitPath = filePath.split("\\")
        const term = splitPath[splitPath.length - 1].split("_")[1]
        return term
    }

    private getFileName(filePath: string) {
        const splitPath = filePath.split("\\")
        const fileName = splitPath[splitPath.length - 1].split(".")[0]
        return fileName
    }

    private getNoOfferings(courses: XLSXCourse[]) {
        const noOfferings: XLSXCourse[] = []

        for (let i = 0; i < courses.length; i++) {
            if (!courses[i]['OFFERING NUMBER'] || courses[i]['OFFERING NUMBER'] === "000") {
                noOfferings.push(courses[i])
            }
        }

        return noOfferings
    }

    public async matchPrevOfferings() {
        const courses = this.readXLSXFile()
        const noOfferings = this.getNoOfferings(courses)

        try {
            const { prevCourses, fileName } = await this.getPrevEnrollment()
            const csvCourseMap = new Map<string, CSVCourse>()
            prevCourses.forEach(course => {
                csvCourseMap.set(course.CourseID, course)
            })

            // Attempt to match courses with no offerings to previous enrollment file
            noOfferings.forEach(course => {
                const matchingCSVCourse = csvCourseMap.get(course['COURSE REFERENCE NUMBER'].toString())
                if (matchingCSVCourse) {
                    course['OFFERING NUMBER'] = matchingCSVCourse.SectionNumber
                }
            })

        } finally {
            const noCanc = noOfferings.filter((course) => course.TITLE !== "CANCELLED")

            // Get remaining courses that didn't have a match
            const noMatch = this.getNoOfferings(noCanc)

            return { courses, noMatch }
        }
    }


    public getPrevEnrollment(): Promise<PrevFileData> {
        return new Promise((resolve, reject) => {
            if (fs.existsSync(this.enrollPath)) {
                fs.readdir(this.enrollPath, (err, files) => {
                    if (err) {
                        reject("Something went wrong with reading enrollment directory")
                    }
                    fs.readFile(path.join(this.enrollPath, files[0]), 'utf-8', (err, data) => {
                        if (err) {
                            reject("Something went wrong reading enrollment file")
                        }
                        resolve({ prevCourses: JSON.parse(data), fileName: files[0].split(".")[0] })
                    })
                })
            }
            else {
                reject("No previous file found")
            }
        })
    }

    private async matchNewOfferings(userOfferings: XLSXCourse[]) {
        try {
            // Get no matches again and fill in with new user submitted offerings
            // Set no matches against corresponding course in map
            const { courses, noMatch } = await this.matchPrevOfferings()

            const coursesMap = new Map<number, XLSXCourse>(courses.map(course => [course['COURSE REFERENCE NUMBER'], course]))
            const userOfferingsMap = new Map<number, XLSXCourse>(userOfferings.map(course => [course['COURSE REFERENCE NUMBER'], course]))

            noMatch.forEach(course => {
                const matchingCourse = userOfferingsMap.get(course['COURSE REFERENCE NUMBER'])
                if (matchingCourse) {
                    course['OFFERING NUMBER'] = matchingCourse['OFFERING NUMBER'] || "000"
                } else {
                    course['OFFERING NUMBER'] = "000"
                }
                coursesMap.set(course['COURSE REFERENCE NUMBER'], course)
            })

            const combinedCourses = Array.from(coursesMap.values())

            return combinedCourses
        } catch (err) {
            throw new Error("Something went wrong matching new offerings")
        }
    }

    public async createPrevEnrollment(filePath: string): Promise<void> {
        const fileName = this.getFileName(filePath)
        const fileStream = fs.createReadStream(filePath)

        return new Promise((resolve, reject) => {
            Papa.parse(fileStream, {
                beforeFirstChunk: (chunk) => {
                    const lines = chunk.split("\n")
                    const header = "UnitNumber,Term,Year,DepartmentName,CourseNumber,SectionNumber,ProfessorName,MaximumCapacity,EstPreEnrollment,ActualEnrollment,ContinuationClass,EveningClass,ExtensionClass,TextnetFlag,Location,CourseTitle,CourseID"

                    const newChunk = [header, ...lines].join("\n")
                    return newChunk
                },
                header: true,
                complete: (results, file) => {
                    const csvResults = results.data as CSVCourse[]

                    if (fs.existsSync(this.enrollPath)) {
                        fs.readdir(this.enrollPath, (err, files) => {
                            fs.unlink(path.join(this.enrollPath, files[0]), (err) => {
                                if (err) {
                                    reject(err)
                                }
                                fs.writeFile(path.join(this.enrollPath, `${fileName}.json`), JSON.stringify(csvResults, null, 4), 'utf8', (err) => {
                                    if (err) {
                                        reject("Something went wrong deleting previous file and creating new file.")
                                    }
                                    resolve()
                                })
                            })

                        })
                    } else {
                        fs.mkdir(this.enrollPath, { recursive: true }, (err) => {
                            if (err) {
                                reject(err)
                            }
                            fs.writeFile(path.join(this.enrollPath, `${fileName}.json`), JSON.stringify(csvResults, null, 4), 'utf8', (err) => {
                                if (err) {
                                    reject("Something went wrong creating new directory and file.")
                                }
                                resolve()
                            })
                        })
                    }

                },
                error: (error, file) => {
                    reject(error)
                }
            })
        })
    }

    public async createCourseCSV(userOfferings: XLSXCourse[]): Promise<{ csv: string, json: CSVCourse[] }> {
        try {
            const newCSVCourses: CSVCourse[] = []
            const allCourses = await this.matchNewOfferings(userOfferings)

            allCourses.forEach((course) => {
                if (course.TITLE !== "CANCELLED") {
                    const newCourse: CSVCourse = {
                        "UnitNumber": course.CAMPUS === "MPC" ? "1" : "2",
                        "Term": this.term[0],
                        "Year": this.term.slice(-2),
                        "DepartmentName": course.SUBJECT,
                        "CourseNumber": course['COURSE NUMBER'].toString(),
                        "SectionNumber": course['OFFERING NUMBER'].toString().padStart(3, "0"),
                        "ProfessorName": course['PRIMARY INSTRUCTOR LAST NAME'] ? course['PRIMARY INSTRUCTOR LAST NAME'].toUpperCase() : "TBD",
                        "MaximumCapacity": course['MAXIMUM ENROLLMENT'].toString(),
                        "EstPreEnrollment": course['MAXIMUM ENROLLMENT'].toString(),
                        "ActualEnrollment": course['ACTUAL ENROLLMENT'].toString(),
                        "ContinuationClass": "",
                        "EveningClass": "",
                        "ExtensionClass": "",
                        "TextnetFlag": "",
                        "Location": "",
                        "CourseTitle": course.TITLE,
                        "CourseID": course['COURSE REFERENCE NUMBER'].toString()
                    }

                    newCSVCourses.push(newCourse)
                }
            })

            return { csv: Papa.unparse(newCSVCourses), json: newCSVCourses }
        } catch (err) {
            console.log(err)
            throw new Error("Something went wrong creating the CSV data")
        }
    }

    private CSVToXLSX(courses: CSVCourse[]) {
        const xlsx: XLSXCourse[] = []

        courses.forEach(course => {
            const newXLSXCourse: XLSXCourse = {
                COLLEGE: "",
                DEPARTMENT: "",
                SUBJECT: course.DepartmentName,
                'COURSE NUMBER': parseInt(course.CourseNumber, 10),
                TITLE: course.CourseTitle,
                'OFFERING NUMBER': course.SectionNumber,
                'PRIMARY INSTRUCTOR LAST NAME': course.ProfessorName,
                'PRIMARY INSTRUCTOR FIRST NAME': "",
                'EMAIL PREFERRED ADDRESS?': "",
                'TARGET ENROLLMENT': parseInt(course.MaximumCapacity, 10),
                'ACTUAL ENROLLMENT': parseInt(course.ActualEnrollment, 10),
                'MAXIMUM ENROLLMENT': parseInt(course.EstPreEnrollment, 10),
                'COURSE REFERENCE NUMBER': parseInt(course.CourseID, 10),
                'START DATE': 0,
                'END DATE': 0,
                CAMPUS: course.UnitNumber === "1" ? "MPC" : "MCV"
            }

            xlsx.push(newXLSXCourse)
        })

        return xlsx
    }
}