import { generateReports } from "./helpers/reportGen"

export const reportProcess = async ({ event, method, data }: ProcessArgs) => {
    if (data.type === "report") {
        switch (method) {
            case 'request':
                try {
                    await generateReports(event, data["isCsv"], data["reqReports"], data["reqTerms"])
                } catch (error) {
                    throw (error)
                }
                event.reply('report-success')
                break
        }
    }
}