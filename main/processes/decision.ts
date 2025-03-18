import { getTermDecisions } from "./helpers/buyDecision"

export const decisionProcess = async ({ event, method, data }: ProcessArgs) => {
    switch (method) {
        case "get-term-decision":
            try {
                if (typeof data === 'object' && !Array.isArray(data)) {
                    const decisions = await getTermDecisions(data.term as string)
                    event.reply('decision-data', { decisions, term: data.term })
                } else {
                    throw "Unexpected data value received from renderer."
                }
            } catch (error) {
                event.reply('decision-data', [])
                throw error
            }
            break
    }
} 