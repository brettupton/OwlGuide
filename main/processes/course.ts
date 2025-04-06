import { regex, bSQLDB } from '../utils'

export const courseProcess = async ({ event, method, data }: ProcessArgs) => {
    if (data.type === "course") {
        switch (method) {
            case 'get-term-course':
                try {
                    const [term, year] = regex.splitFullTerm(data.term)
                    const { queryResult, totalRows } = await bSQLDB.courses.getCoursesByTerm(term, year, data.limit, data.isForward, data.isSearch, data.pivotCourse)

                    event.reply('course-data', { courses: queryResult, total: totalRows, term: term + year })
                } catch (error) {
                    throw error
                }
                break
        }
    }
}