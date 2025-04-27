<<<<<<< HEAD
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

=======
import axios, { AxiosInstance } from "axios"
import { wrapper } from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'
import { BannerCourse, BannerTerm, CSVCourse, IntermCourse, XLSXCourse } from "../../../types/Enrollment"
import { fileHandler, bSQLDB, regex } from "../../utils"
import Papa from 'papaparse'

const BASE_URL = 'https://reg-prod.ec.vcu.edu/StudentRegistrationSsb/ssb'
const REQUEST_TIMEOUT_MS = 5000 // 5sec
const MAX_PAGE_SIZE = 40 // Provides fastest data response

>>>>>>> main
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
<<<<<<< HEAD
>>>>>>> main
=======
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
=======
>>>>>>> main
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
<<<<<<< HEAD
>>>>>>> main
=======
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
<<<<<<< HEAD
const submitEnrollment = async (enrollment: string[][], filePath: string) => {
    try {
        const fileName = regex.matchFileName(filePath)
        const [term = null, year = null] = regex.matchFileTermYear(filePath) || []
        if (!fileName) throw `Unexpected file name. Rename with term and try again.`
=======
=======
>>>>>>> main
const submitEnrollment = async (enrollment: IntermCourse[], filePath: string) => {
    try {
        const fileName = regex.matchFileName(filePath)
        const [term, year] = regex.matchFileTermYear(filePath)
        if (!term) throw `Unexpected file name. Rename with term and try again.`
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main

        const csv = createCourseCSV(enrollment, term, year)
        return { fileName, csv }
    } catch (error) {
        throw error
    }
}

<<<<<<< HEAD
<<<<<<< HEAD
const createCourseCSV = (enrollment: string[][], term: string, year: string) => {
=======
const createCourseCSV = (enrollment: IntermCourse[], term: string, year: string) => {
>>>>>>> main
=======
const createCourseCSV = (enrollment: IntermCourse[], term: string, year: string) => {
>>>>>>> main
    const csvCourses: CSVCourse[] = []

    enrollment.forEach((course) => {
        const newCourse: CSVCourse = {
<<<<<<< HEAD
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
=======
>>>>>>> main
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
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
            "ContinuationClass": "",
            "EveningClass": "",
            "ExtensionClass": "",
            "TextnetFlag": "",
            "Location": "",
<<<<<<< HEAD
<<<<<<< HEAD
            "CourseTitle": course[7],
            "CourseID": course[8]
=======
            "CourseTitle": course["Title"],
            "CourseID": course["CRN"]
>>>>>>> main
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
<<<<<<< HEAD

export { matchEnrollment, submitEnrollment }
=======
export { initialMatch, submitEnrollment }
>>>>>>> main
=======
const fetchBannerTerms = async () => {
    const termReq = await axios.get(BASE_URL + '/classSearch/getTerms', {
        params: {
            searchTerm: "",
            offset: 1,
            max: 3,
            _: Date.now()
        }
    })

    return termReq?.data as BannerTerm[]
}

const initializeBannerSession = async (termCode: string) => {
    const jar = new CookieJar()
    const client = wrapper(axios.create({ jar }))

    const sessionStart = Date.now()
    const uniqueSessionId = Math.random().toString(36).substr(2, 5) + sessionStart

    await client.post(BASE_URL + '/term/search?mode=search',
        {
            term: termCode,
            studyPath: "",
            studyPathText: "",
            startDatepicker: "",
            endDatepicker: "",
            uniqueSessionId: uniqueSessionId
        },
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })

    return { uniqueSessionId, client }
}

const fetchBannerSubjects = async (term: string, client: AxiosInstance, sessionId: string) => {
    const timeStart = Date.now()
    const allSubjects: string[] = []
    const pageSize = 50
    let offset = 1

    // Average time to fetch all subjects is ~1s so timeout is just a failsafe
    while ((Date.now() - timeStart) < REQUEST_TIMEOUT_MS) {
        const subjectResponse = await client.get(BASE_URL + '/classSearch/get_subject', {
            params: {
                searchTerm: '',
                term,
                offset,
                max: pageSize,
                uniqueSessionId: sessionId,
                _: Date.now()
            }
        })

        const currBatch = subjectResponse?.data as { code: string, description: string }[]
        if (currBatch.length <= 0) break
        allSubjects.push(...currBatch.map((subject) => subject["code"]))
        if (currBatch.length < pageSize) break
        offset++
    }

    return allSubjects
}

const fetchPage = async (term: string, client: AxiosInstance, subject: string, pageSize: number, pageOffset: number, sessionId: string) => {
    const pageResponse = await client.get(BASE_URL + '/searchResults/searchResults', {
        params: {
            txt_subject: subject,
            txt_term: term,
            startDatepicker: '',
            endDatepicker: '',
            uniqueSessionId: sessionId,
            pageOffset: pageOffset,
            pageMaxSize: pageSize,
            sortColumn: 'subjectDescription',
            sortDirection: 'asc'
        }
    })

    return pageResponse?.data.data as BannerCourse[]
}

const fetchBannerSections = async (term: string, client: AxiosInstance, subject: string, sessionId: string): Promise<CSVCourse[]> => {
    const allSections: CSVCourse[] = []

    return new Promise(async (resolve, reject) => {
        // Required post request before attempting to fetch new subject data
        await client.post(BASE_URL + '/classSearch/resetDataForm')

        // Basic initial request to retrieve total number of sections
        const initResponse = await client.get(BASE_URL + '/searchResults/searchResults', {
            params: {
                txt_subject: subject,
                txt_term: term,
                startDatepicker: '',
                endDatepicker: '',
                uniqueSessionId: sessionId,
                pageOffset: 0,
                pageMaxSize: 1,
                sortColumn: 'subjectDescription',
                sortDirection: 'asc'
            }
        })

        const totalCount = initResponse?.data.totalCount
        const pagesNeeded = Math.ceil(totalCount / MAX_PAGE_SIZE)
        const pagePromises: Promise<BannerCourse[]>[] = []

        for (let i = 0; i < pagesNeeded; i++) {
            pagePromises.push(fetchPage(term, client, subject, MAX_PAGE_SIZE, i * MAX_PAGE_SIZE, sessionId))
        }

        try {
            const pages = await Promise.all(pagePromises)
            for (const pageSections of pages) {
                allSections.push(
                    ...pageSections.map(pageSection => {
                        // Assume all non-MCV campus descriptions are Monroe Park
                        const unitNum = pageSection.campusDescription === "MCV" ? "2" : "1"
                        const [term, year] = regex.splitFullTermDesc(pageSection.termDesc)
                        const professor = pageSection.faculty.length > 0
                            // Find index instructor listed as primary in faculty array, defaulting to 0 if not found
                            ? pageSection.faculty.findIndex((instructor) => instructor.primaryIndicator) > 0
                                ? regex.decodeHTMLEntities(regex.getFacultyLastName(pageSection.faculty[pageSection.faculty.findIndex((instructor) => instructor.primaryIndicator)].displayName))
                                : regex.decodeHTMLEntities(regex.getFacultyLastName(pageSection.faculty[0].displayName))
                            : "TBD"
                        const title = regex.decodeHTMLEntities(pageSection.courseTitle)

                        return {
                            UnitNumber: unitNum,
                            Term: term,
                            Year: year,
                            DepartmentName: pageSection.subject,
                            CourseNumber: pageSection.courseNumber,
                            SectionNumber: pageSection.sequenceNumber,
                            ProfessorName: professor,
                            MaximumCapacity: (pageSection.maximumEnrollment).toString(),
                            EstPreEnrollment: (pageSection.maximumEnrollment).toString(),
                            ActualEnrollment: (pageSection.enrollment).toString(),
                            ContinuationClass: "",
                            EveningClass: "",
                            ExtensionClass: "",
                            TextnetFlag: "",
                            Location: "",
                            CourseTitle: title,
                            CourseID: pageSection.courseReferenceNumber
                        }
                    })
                )
            }
            resolve(allSections)
        } catch (error) {
            reject(error)
        }
    })
}

const fetchBannerCourses = async (currWindow: Electron.BrowserWindow, termCode: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const { client: initClient, uniqueSessionId: initSessionId } = await initializeBannerSession(termCode)
        const subjects = await fetchBannerSubjects(termCode, initClient, initSessionId)

        const subjectPromises: Promise<CSVCourse[]>[] = []
        const totalSubjects = subjects.length
        let currentPromise = 0

        if (totalSubjects <= 0) {
            reject(`Error fetching subjects for ${termCode}.`)
        }

        for (let i = 0; i < totalSubjects; i++) {
            // Creating new session for each subject allows for concurrency in fetching
            const { client: currClient, uniqueSessionId: currSessionId } = await initializeBannerSession(termCode)
            // Update progress after promise resolve but return result to array
            const p = fetchBannerSections(termCode, currClient, subjects[i], currSessionId)
                .then(result => {
                    currentPromise++
                    const totalProgress = ((currentPromise / totalSubjects) * 100).toFixed(0)
                    currWindow.webContents.send('progress-update', { updatedProgress: totalProgress })

                    return result
                })

            subjectPromises.push(p)
        }

        try {
            const courses = await Promise.all(subjectPromises)
            const csvCourses = Papa.unparse(courses.flat(), { header: false })

            resolve(csvCourses)
        } catch (error) {
            reject(error)
        }
    })
}

export { initialMatch, submitEnrollment, fetchBannerTerms, fetchBannerCourses }
>>>>>>> main
