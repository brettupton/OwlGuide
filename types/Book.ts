type Course = {
    course: string
    professor: string
}

export type Semester = {
    courses: Course[]
    est_enrl: number
    act_enrl: number
    est_sales: number
    act_sales: number
    reorders: number
}

export type Book = {
    semesters: {
        [Term: string]: Semester
    },
    total_est_enrl: number
    total_act_enrl: number
    total_est_sales: number
    total_act_sales: number
    total_reorders: number
    isbn_10?: string
    title?: string
    author?: string
    publisher?: string
    publish_date?: string
    number_of_pages?: number | string
}

export type Sales = {
    [ISBN: string]: Book
}