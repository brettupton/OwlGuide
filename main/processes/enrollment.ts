import { CSVCourse, XLSXCourse } from "../../types/Enrollment"
import { fileSys } from "../utils"
import Papa from 'papaparse'

const matchEnrollment = async (filePaths: string[]) => {
    try {
        // Multiple files, search for XLSX and CSV paths in array
        const xlsxFilePath = filePaths.find((filePath) => filePath.search(/xlsx/) > -1)
        const csvFilePath = filePaths.find((filePath) => filePath.search(/csv/) > -1)
        const data = await fileSys.xlsx.read(xlsxFilePath, 'enrollment')

        const match = xlsxFilePath.match(/([A-Za-z]+)(\d+)/)
        let term = ""
        if (!match || !match[1] || !match[2]) {
            throw new Error("Term Regex Not Found ([A-Za-z]+)(\d+)")
        }
        term = `${match[1]} ${match[2]}`

        let csvFile = await fileSys.resources.read("enrollment", term)

        // Check if user submitted CSV file to use for matching
        if (csvFilePath) {
            csvFile = await fileSys.csv.read(csvFilePath)
        }

        if (csvFile.length > 0) {
            // Match previously submitted offerings from CSV File, if they exist
            // Map is used for O(n) time
            const csvMap = {}
            csvFile.forEach((csvCourse) => {
                csvMap[Number(csvCourse["CourseID"])] = csvCourse["SectionNumber"]
            })

            data.forEach((xlsxCourse) => {
                if (!xlsxCourse["OFFERING NUMBER"] || xlsxCourse["OFFERING NUMBER"] === "000") {
                    const match = csvMap[xlsxCourse["COURSE REFERENCE NUMBER"]]
                    xlsxCourse["OFFERING NUMBER"] = match ? match : "000"
                }
            })
        }

        // Write file name to temp directory for access later
        await fileSys.temp.write(xlsxFilePath.split(".")[0].split("\\").at(-1))

        return data.filter((course) => course["TITLE"] !== "CANCELLED")
    } catch (error) {
        throw error
    }
}

const submitEnrollment = async (enrollment: XLSXCourse[]) => {
    try {
        // Read file path from temp directory and extract term
        const fileName = await fileSys.temp.read()
        const [match, term, year] = fileName.match(/([A-Za-z]+)(\d+)/)

        const csv = createCourseCSV(enrollment, term, year)

        return { fileName, csv }
    } catch (error) {
        throw error
    }
}

const createCourseCSV = (enrollment: XLSXCourse[], term: string, year: string) => {
    const csvCourses: CSVCourse[] = []

    enrollment.forEach((course) => {
        const newCourse: CSVCourse = {
            "UnitNumber": course.CAMPUS === "MPC" ? "1" : "2",
            "Term": term,
            "Year": year,
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
        csvCourses.push(newCourse)
    })

    return Papa.unparse(csvCourses)
}


export { matchEnrollment, submitEnrollment }