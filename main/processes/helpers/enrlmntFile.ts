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
            for (const field of requiredFields) {
                if (course[field] === undefined) {
                    throw new Error(`Missing value for required field: ${field}\n${JSON.stringify(course)}`)
                }
            }

            // Don't include cancelled courses
            if (course["TITLE"] === "CANCELLED") return

            const CRN = course["COURSE REFERENCE NUMBER"].toString()
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
    } catch (error) {
        throw error
    }
}

const findSectionNum = (termSections: DBRow[], CRN: string): string => {
    const matchCourse = termSections.find(course => course["CRN"] != null && course["CRN"].toString() === CRN)

    return matchCourse ? matchCourse["Section"] as string : "0"
}

const submitEnrollment = async (enrollment: IntermCourse[], filePath: string) => {
    try {
        const fileName = regex.matchFileName(filePath)
        const [term, year] = regex.matchFileTermYear(filePath)
        if (!term) throw `Unexpected file name. Rename with term and try again.`

        const csv = createCourseCSV(enrollment, term, year)
        return { fileName, csv }
    } catch (error) {
        throw error
    }
}

const createCourseCSV = (enrollment: IntermCourse[], term: string, year: string) => {
    const csvCourses: CSVCourse[] = []

    enrollment.forEach((course) => {
        const newCourse: CSVCourse = {
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
            "ContinuationClass": "",
            "EveningClass": "",
            "ExtensionClass": "",
            "TextnetFlag": "",
            "Location": "",
            "CourseTitle": course["Title"],
            "CourseID": course["CRN"]
        }
        csvCourses.push(newCourse)
    })

    return Papa.unparse(csvCourses, { header: false })
}

export { initialMatch, submitEnrollment }