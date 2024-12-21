import { bSQLDB } from "../utils"
import { updateDB, initializeDB } from "./helpers/sqlDatabase"

export const sqlProcess = async ({ event, method, data }: ProcessArgs) => {
    switch (method) {
        case "get-terms":
            try {
                const terms = await bSQLDB.all.getAllTerms()
                event.reply("term-list", { terms: terms.map((term) => term.Term) })
            } catch (error) {
                throw error
            }
            break

        case "update-db":
            console.log("Updating tables.")

            if (typeof data === 'object') {
                const files = data["files"] as string[]

                try {
                    const timeStart = Date.now()
                    await updateDB(files)
                    const timeEnd = Date.now()

                    console.log(`Tables updated in ${(timeEnd - timeStart) / 1000}s`)
                } catch (error) {
                    throw error
                }
            }
            break

        case "recreate-db":
            try {
                const timeStart = Date.now()
                await initializeDB()
                const timeEnd = Date.now()

                console.log(`DB recreated in ${(timeEnd - timeStart) / 1000}s`)
            } catch (error) {
                throw error
            }
            break
    }
}