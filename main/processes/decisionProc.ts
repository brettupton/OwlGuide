import { getTermDecisions } from "./helpers/buyDecision"

export const decisionProcess = async ({ event, method, data }: ProcessArgs) => {
    if (data.type === "decision") {
        switch (method) {
            case "get-term-decision":
                try {
                    const decisions = await getTermDecisions(data.term)
                    event.reply('decision-data', { decisions, term: data.term })
                } catch (error) {
                    event.reply('decision-data', [])
                    throw error
                }
                break
        }
    }
} 