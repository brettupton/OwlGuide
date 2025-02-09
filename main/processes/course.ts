import { regex, bSQLDB } from '../utils'

export const courseProcess = async ({ event, method, data }: ProcessArgs) => {
    switch (method) {
        case 'get-term-course':
            try {
                if (typeof data === 'object' && !Array.isArray(data)) {
                    const [term, year] = regex.splitFullTerm(data.term as string)
                    const { queryResult, totalRows } = await bSQLDB.courses.getCoursesByTerm(term, year, data.limit as number, data.isForward as boolean, data.isSearch as boolean, data.pivotCourse as { Dept: string; Course: string; Section: string })

                    event.reply('course-data', { courses: queryResult, total: totalRows, term: term + year })
                } else {
                    throw "Unexpected data value received."
                }
            } catch (error) {
                throw error
            }
            break
    }
}