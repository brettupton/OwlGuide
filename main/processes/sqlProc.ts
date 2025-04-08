import { bSQLDB, fileHandler, paths } from "../utils"
import { syncDB, initializeDB, getIBMTables } from "./helpers/sqlDatabase"

export const sqlProcess = async ({ event, method, data }: ProcessArgs) => {
    if (data.type === "sql") {
        switch (method) {
            case "get-terms":
                try {
                    const terms = await bSQLDB.all.getAllTerms()
                    event.reply("term-list", { terms: terms.map((term) => term.Term) })
                } catch (error) {
                    throw error
                }
                break

            case "update-db-manual":
                try {
                    await syncDB(data["files"])
                    event.reply('update-success')
                } catch (error) {
                    event.reply('update-fail')
                    throw error
                }
                break

            case "update-db":
                try {
                    // Access IBMi with CLI to load tables into temp directory
                    await getIBMTables(data["userInfo"]["userId"], data["userInfo"]["password"])

                    // Get string array of temp file names
                    const files = await fileHandler.files.names(paths.tempPath)
                    await syncDB(files)

                    event.reply('update-success')
                } catch (error) {
                    event.reply('update-fail')
                    throw error
                }
                break

            case "recreate-db":
                try {
                    await initializeDB()
                } catch (error) {
                    throw error
                }
                break
        }
    }
}