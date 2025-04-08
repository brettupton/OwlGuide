<<<<<<< HEAD
import { CSVCourse, XLSXCourse } from "../../../types/Enrollment"
<<<<<<< HEAD
<<<<<<< HEAD
import { fileManager, bSQLDB, regex } from "../../utils"
=======
import { fileHandler, bSQLDB, regex } from "../../utils"
>>>>>>> main
=======
import { fileHandler, bSQLDB, regex } from "../../utils"
>>>>>>> main
import Papa from 'papaparse'

const matchEnrollment = async (filePath: string) => {
    try {
<<<<<<< HEAD
<<<<<<< HEAD
        const courses = await fileManager.xlsx.read(filePath) as XLSXCourse[]
=======
        const courses = await fileHandler.xlsx.read(filePath) as XLSXCourse[]
>>>>>>> main
=======
        const courses = await fileHandler.xlsx.read(filePath) as XLSXCourse[]
>>>>>>> main
        const newEnrl: string[][] = []

        const [term = null, year = null] = regex.matchFileTermYear(filePath) || []
        if (!term) throw `Unexpected file name. Rename with term and try again.`

        const termSections = await bSQLDB.courses.getSectionsByTerm(term, year)

        courses.forEach(async (course) => {
            // Verify all needed fields exist in course file
            const requiredFields = [
                "COURSE REFERENCE NUMBER",
                "CAMPUS",
                "SUBJECT",
                "COURSE NUMBER",
                "MAXIMUM ENROLLMENT",
                "ACTUAL ENROLLMENT",
                "TITLE"
            ]

=======
import { CSVCourse, IntermCourse, XLSXCourse } from "../../../types/Enrollment"
import { fileHandler, bSQLDB, regex } from "../../utils"
import Papa from 'papaparse'

const initialMatch = async (filePath: string) => {
    try {
        const courses = await fileHandler.xlsx.read(filePath) as XLSXCourse[]
        const matchedCourses: IntermCourse[] = []

        const [term, year] = regex.matchFileTermYear(filePath)
        if (!term) throw `Unexpected file name. Rename with term and try again.`

        // Required fields for CSV
        const requiredFields = [
            "COURSE REFERENCE NUMBER",
            "CAMPUS",
            "SUBJECT",
            "COURSE NUMBER",
            "MAXIMUM ENROLLMENT",
            "ACTUAL ENROLLMENT",
            "TITLE",
            "CAMPUS"
        ]

        // Query for all sections in term for matching
        const termSections = await bSQLDB.courses.getSectionsByTerm(term, year)

        courses.forEach(async (course) => {
>>>>>>> main
            for (const field of requiredFields) {
                if (course[field] === undefined) {
                    throw new Error(`Missing value for required field: ${field}\n${JSON.stringify(course)}`)
                }
            }

            // Don't include cancelled courses
            if (course["TITLE"] === "CANCELLED") return

            const CRN = course["COURSE REFERENCE NUMBER"].toString()
<<<<<<< HEAD
            // If no offering number, find potential match from database
            const oNum = course["OFFERING NUMBER"] ?? findSectionNum(termSections, CRN)
            const prof = course["PRIMARY INSTRUCTOR LAST NAME"] ? course["PRIMARY INSTRUCTOR LAST NAME"].toString().toUpperCase() : "TBD"

            newEnrl.push([
                course["CAMPUS"].toString(),
                course["SUBJECT"].toString(),
                course["COURSE NUMBER"].toString().padStart(3, "0"),
                oNum,
                prof,
                course["MAXIMUM ENROLLMENT"].toString(),
                course["ACTUAL ENROLLMENT"].toString(),
                course["TITLE"].toString(),
                CRN
            ])
        })

        return newEnrl
=======
            const offNum = findSectionNum(termSections, CRN)

            matchedCourses.push({
                Unit: course["CAMPUS"] === "MPC" ? "1" : "2",
                CRN,
                Dept: course["SUBJECT"],
                Course: course["COURSE NUMBER"].toString().padStart(3, "0"),
                Section: offNum,
                Prof: course["PRIMARY INSTRUCTOR LAST NAME"] ? course["PRIMARY INSTRUCTOR LAST NAME"].toUpperCase() : "TBD",
                Title: course["TITLE"],
                EstEnrl: course["MAXIMUM ENROLLMENT"].toString(),
                ActEnrl: course["ACTUAL ENROLLMENT"].toString()
            })
        })

        return matchedCourses
>>>>>>> main
    } catch (error) {
        throw error
    }
}

const findSectionNum = (termSections: DBRow[], CRN: string): string => {
    const matchCourse = termSections.find(course => course["CRN"] != null && course["CRN"].toString() === CRN)

    return matchCourse ? matchCourse["Section"] as string : "0"
}

<<<<<<< HEAD
const submitEnrollment = async (enrollment: string[][], filePath: string) => {
    try {
        const fileName = regex.matchFileName(filePath)
        const [term = null, year = null] = regex.matchFileTermYear(filePath) || []
        if (!fileName) throw `Unexpected file name. Rename with term and try again.`
=======
const submitEnrollment = async (enrollment: IntermCourse[], filePath: string) => {
    try {
        const fileName = regex.matchFileName(filePath)
        const [term, year] = regex.matchFileTermYear(filePath)
        if (!term) throw `Unexpected file name. Rename with term and try again.`
>>>>>>> main

        const csv = createCourseCSV(enrollment, term, year)
        return { fileName, csv }
    } catch (error) {
        throw error
    }
}

<<<<<<< HEAD
const createCourseCSV = (enrollment: string[][], term: string, year: string) => {
=======
const createCourseCSV = (enrollment: IntermCourse[], term: string, year: string) => {
>>>>>>> main
    const csvCourses: CSVCourse[] = []

    enrollment.forEach((course) => {
        const newCourse: CSVCourse = {
<<<<<<< HEAD
            "UnitNumber": course[0] === "MPC" ? "1" : "2",
            "Term": term,
            "Year": year,
            "DepartmentName": course[1],
            "CourseNumber": course[2],
            "SectionNumber": course[3].toString().padStart(3, "0"),
            "ProfessorName": course[4],
            "MaximumCapacity": course[5],
            "EstPreEnrollment": course[5],
            "ActualEnrollment": course[6],
=======
            "UnitNumber": course["Unit"],
            "Term": term,
            "Year": year,
            "DepartmentName": course["Dept"],
            "CourseNumber": course["Course"],
            // Pad start to handle possible empty strings
            "SectionNumber": course["Section"].padStart(3, "0"),
            "ProfessorName": course["Prof"],
            "MaximumCapacity": course["EstEnrl"],
            "EstPreEnrollment": course["EstEnrl"],
            "ActualEnrollment": course["ActEnrl"],
>>>>>>> main
            "ContinuationClass": "",
            "EveningClass": "",
            "ExtensionClass": "",
            "TextnetFlag": "",
            "Location": "",
<<<<<<< HEAD
            "CourseTitle": course[7],
            "CourseID": course[8]
=======
            "CourseTitle": course["Title"],
            "CourseID": course["CRN"]
>>>>>>> main
        }
        csvCourses.push(newCourse)
    })

    return Papa.unparse(csvCourses, { header: false })
}

<<<<<<< HEAD

export { matchEnrollment, submitEnrollment }
=======
export { initialMatch, submitEnrollment }
>>>>>>> main
