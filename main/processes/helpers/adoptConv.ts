import { AdoptionCSV, NoAdoption } from "../../../types/Adoption"
import Papa from 'papaparse'
import { regex } from "../../utils"

const formatToCSV = (courses: NoAdoption[], fullTerm: string) => {
    const [term, year] = regex.splitFullTerm(fullTerm)
    const stringTerm = term === "F" ? "Fall" : term === "W" ? "Spring" : term === "A" ? "Summer" : ""
    const aipLimit = 1000 // AIP has limit of amount of courses per CSV

    const csvCourses = courses.map((course) => {
        const isNoText = course["NoText"]
        const rejectMessage: string = isNoText ? undefined : findRejectCourse(course)

        if (!rejectMessage) {
            return {
                'CampusName': "Barnes & Noble @ VCU",
                'TermTitle': `${stringTerm} 20${year}`,
                'SectionCode': `${course["Dept"]}_${course["Course"]}_${course["Section"]}`,
                'ISBN': isNoText ? null : course["ISBN"].trim(),
                'SKU-First Day Sections Only': null,
                'AdoptionCondition ( Non-First Day Sections Only)': isNoText ? null : "Any",
                'AdoptionType ( Non-First Day Sections Only)': isNoText ? null : "Required",
                'Notes': null,
                'NoMaterials ( Non-First Day Sections Only "Y/N")': isNoText ? "Y" : "N"
            }
        }
    })

    // Split array into chunks based on limit
    const csvChunkArr: AdoptionCSV[][] = csvCourses.reduce((resultArr, course, index) => {
        const chunkIndex = Math.floor(index / aipLimit)

        if (!resultArr[chunkIndex]) {
            resultArr[chunkIndex] = [] // Start a new chunk
        }

        resultArr[chunkIndex].push(course)

        return resultArr
    }, [])

    return csvChunkArr.map((csv) => Papa.unparse(csv))
}

const findRejectCourse = (course: NoAdoption): string => {
    const rejectConditions = [
        {
            condition: () => course["ISBN"].length < 13,
            message: `ISBN Length Incorrect; Expected: 13, Received: ${course["ISBN"].length}`,
        },
        {
            condition: () => course["ISBN"].substring(0, 3) === "822",
            message: "eBooks Cannot Be Uploaded",
        },
    ]

    for (let i = 0; i < rejectConditions.length; i++) {
        const currCondition = rejectConditions[i]
        if (currCondition.condition) {
            return currCondition.message
        }
    }
}

export { formatToCSV }