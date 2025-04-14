import { NoAdoption } from "../types/Adoption"
import { BannerTerm, IntermCourse } from "../types/Enrollment"

declare global {
    type DBRow = {
        [field: string]: string | number | null
    }

    type Config = {
        [key: string]: string
    }

    type AppRendererData = {}

    type AdoptionRendererData = {
        term: string
        adoptions: NoAdoption[]
    }

    type BookRendererData = {
        isbn: string
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
        term: BannerTerm
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

    type ProcessArgs = {
        event?: Electron.IpcMainEvent
        process?: string
        method: string
        data: RendererData
    }
}

export { }