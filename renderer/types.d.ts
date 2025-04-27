import { NoAdoption } from "../types/Adoption"
<<<<<<< HEAD
import { IntermCourse } from "../types/Enrollment"
=======
import { BannerTerm, IntermCourse } from "../types/Enrollment"
>>>>>>> main

declare global {
    type DBRow = {
        [field: string]: string | number | null
    }

    type Config = {
        [key: string]: string
    }

<<<<<<< HEAD
<<<<<<< HEAD
    type JSObj =
        | string
        | number
        | boolean
        | { [key: string]: JSObj }
        | JSObj[]
=======
=======
>>>>>>> main
    type AppRendererData = {}

    type AdoptionRendererData = {
        term: string
        adoptions: NoAdoption[]
    }

    type BookRendererData = {
<<<<<<< HEAD
        isbn: string
=======
        reqBook: {
            isbn: string
            title: string
        }
>>>>>>> main
    }

    type CourseRendererData = {
        term: string
        limit: number
        isForward: boolean
        isSearch: boolean
        pivotCourse: {
            Dept: string
            Course: string
            Section: string
        }
    }

    type DecisionRendererData = {
        term: string
    }

    type EnrollmentRendererData = {
        enrollment: IntermCourse[]
        fileArr: string[]
<<<<<<< HEAD
=======
        term: BannerTerm
>>>>>>> main
    }

    type OrderRendererData = {
        term: string
        searchVendor: string
        searchPO: string
    }

    type ReportRendererData = {
        isCsv: boolean
        reqReports: string[]
        reqTerms: string[]
    }

    type SQLRendererData = {
        files: string[]
        userInfo: {
            userId: string
            password: string
        }
    }

    type RendererData =
        | ({ type: "app" } & AppRendererData)
        | ({ type: "adoption" } & AdoptionRendererData)
        | ({ type: "book" } & BookRendererData)
        | ({ type: "course" } & CourseRendererData)
        | ({ type: "decision" } & DecisionRendererData)
        | ({ type: "enrollment" } & EnrollmentRendererData)
        | ({ type: "order" } & OrderRendererData)
        | ({ type: "report" } & ReportRendererData)
        | ({ type: "sql" } & SQLRendererData)
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main

    type ProcessArgs = {
        event?: Electron.IpcMainEvent
        process?: string
        method: string
<<<<<<< HEAD
<<<<<<< HEAD
        data: JSObj
    }

=======
        data: RendererData
    }
>>>>>>> main
=======
        data: RendererData
    }
>>>>>>> main
}

export { }