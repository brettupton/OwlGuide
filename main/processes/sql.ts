import { bSQLDB, fileManager, paths } from "../utils"
import { updateDB, initializeDB, getIBMTables } from "./helpers/sqlDatabase"

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
            try {
                const { userId, password } = data["userInfo"]
                await getIBMTables(userId, password)
                // getIBMTables loads tables into temp directory
                const files = await fileManager.files.names(paths.tempPath)

                await updateDB(files)
            } catch (error) {
                throw error
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