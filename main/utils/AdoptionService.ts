import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
import { RawAdoption, Adoption } from '../../types/Adoption'
import { AdoptionCSV, TemplateAdoption } from '../../types/TemplateAdoption'

export class AdoptionService {
    private readonly filePath: string
    private initialized: boolean
    private campus: string
    private term: string
    private courses: RawAdoption[]

    constructor(filePath?: string) {
        this.filePath = filePath
    }

    public async initialize() {
        if (!this.initialized) {
            try {
                this.courses = await this.parseCSV()
                this.initialized = true
            } catch (error) {
                throw new Error('Error initializing data:', error)
            }
        }
    }

    private parseCSV(): Promise<RawAdoption[]> {
        const fileStream = fs.createReadStream(path.join(this.filePath))

        return new Promise((resolve, reject) => {
            Papa.parse(fileStream, {
                encoding: 'utf-8',
                beforeFirstChunk: (chunk) => {
                    // Collect campus and term data before returning data after first seven lines
                    const lines = chunk.split('\n')

                    this.campus = (lines[3].split(",")[1]).replace(/['"]+/g, '')
                    this.term = (lines[4].split(",")[1]).replace(/['"]+/g, '')

                    const remainingChunk = lines.slice(7).join('\n')
                    return remainingChunk
                },
                header: true,
                transformHeader: (header) => {
                    return header.trim()
                },
                complete: (results, file) => {
                    const csvResult = results.data as RawAdoption[]
                    resolve(csvResult)
                },
                error: (error, file) => {
                    reject(error)
                }
            })
        })
    }

    public async getTerm() {
        await this.initialize()
        return this.term
    }

    public async getCampus() {
        await this.initialize()
        return this.campus
    }

    public async getCourses() {
        await this.initialize()
        const cleanCourses: Adoption[] = []


        for (let i = 0; i < this.courses.length; i++) {
            let instructor = this.courses[i].Instructor
            let section = this.courses[i].Section

            if (instructor === "No Instructor Assigned") {
                instructor = "TBD"
            }

            if (instructor.indexOf(",") !== -1) {
                instructor = instructor.split(",")[0]
            }

            //Return only last name or second to last name & last name 
            const profNameSplit = instructor.split(' ')
            if (profNameSplit.length > 2) {
                const lastName = profNameSplit[profNameSplit.length - 1].toUpperCase()
                const secondToLastName = profNameSplit[profNameSplit.length - 2].toUpperCase()
                instructor = `${secondToLastName} ${lastName}`
            } else {
                instructor = profNameSplit[profNameSplit.length - 1].toUpperCase()
            }

            section = section.split("_").join(" ")

            cleanCourses.push({
                Course: section,
                Title: this.courses[i]['Course Title'],
                Professor: instructor,
                Status: this.courses[i].Status
            })
        }

        return cleanCourses
    }

    public downloadCSV(data: TemplateAdoption[], term: string, campus: string) {
        const newCSVTemplate: AdoptionCSV[] = []

        for (let i = 0; i < data.length; i++) {
            const newAdoption: AdoptionCSV = {
                'CampusName': campus,
                'TermTitle': term,
                'SectionCode': (data[i].Course).split(" ").join("_"),
                'ISBN': parseInt(data[i].ISBN, 10),
                'SKU-First Day Sections Only': null,
                'AdoptionCondition ( Non-First Day Sections Only)': data[i].ISBN !== "" ? "Any" : null,
                'AdoptionType ( Non-First Day Sections Only)': data[i].ISBN !== "" ? "Required" : null,
                'Notes': null,
                'NoMaterials ( Non-First Day Sections Only "Y/N")': data[i].ISBN !== "" ? "N" : "Y"
            }
            console.log((data[i].Course).replace(/\s/g, "_"))
            newCSVTemplate.push(newAdoption)
        }

        return Papa.unparse(newCSVTemplate)
    }

    public async getSeperatedCourses() {
        let courses: Adoption[]
        const sub: Adoption[] = []
        const unsub: Adoption[] = []

        try {
            courses = await this.getCourses()
        } catch (err) {
            console.error("Error reading file: ", err)
            return
        }

        for (let i = 0; i < courses.length; i++) {
            if (courses[i].Status === "Submitted") {
                sub.push(courses[i])
            } else if (courses[i].Status === "Not Submitted") {
                unsub.push(courses[i])
            }
        }

        return { sub, unsub }
    }
}