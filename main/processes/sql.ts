import fs from 'fs'
<<<<<<< HEAD
import { bSQLDB, fileManager, paths } from "../utils"
=======
import { bSQLDB, config, fileHandler, paths, regex } from "../utils"
>>>>>>> main
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

        case "update-db-manual":
            try {
                const files = data["files"]

                await updateDB(files)
                event.reply('update-success')
            } catch (error) {
                event.reply('update-fail')
                throw error
            }
            break

        case "update-db":
            try {
                const { userId, password } = data["userInfo"]
                // Create temp directory if doesn't exist
                if (!fs.existsSync(paths.tempPath)) {
<<<<<<< HEAD
                    await fileManager.files.create(paths.tempPath)
=======
                    await fileHandler.files.create(paths.tempPath)
>>>>>>> main
                }
                // Access IBMi with CLI to load tables into temp directory
                await getIBMTables(userId, password)

<<<<<<< HEAD
                const files = await fileManager.files.names(paths.tempPath)

                await updateDB(files)
=======
                // Get string array of temp file names
                const files = await fileHandler.files.names(paths.tempPath)
                await updateDB(files)

>>>>>>> main
                event.reply('update-success')
            } catch (error) {
                event.reply('update-fail')
                throw error
            }
            break

        case "recreate-db":
            try {
<<<<<<< HEAD
                const timeStart = Date.now()
                await initializeDB()
                const timeEnd = Date.now()

                console.log(`DB recreated in ${(timeEnd - timeStart) / 1000}s`)
=======
                await initializeDB()
>>>>>>> main
            } catch (error) {
                throw error
            }
            break
    }
}