import { regex, bSQLDB } from '../utils'

export const courseProcess = async ({ event, method, data }: ProcessArgs) => {
    switch (method) {
        case 'get-term-course':
            try {
                if (typeof data === 'object' && !Array.isArray(data)) {
                    const [term, year] = regex.splitFullTerm(data.term as string)
                    const { queryResult, totalRowCount } = await bSQLDB.courses.getCoursesByTerm(term, year, data.limit as number, data.lastCourse as { ID: number; Dept: string; Course: string; Section: string })

                    event.reply('course-data', { courses: queryResult, total: totalRowCount, term: term + year })
                } else {
                    throw "Unexpected data value received from renderer."
                }
            } catch (error) {
                throw error
            }
            break
    }
}