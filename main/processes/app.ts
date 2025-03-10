import { app } from 'electron'
<<<<<<< HEAD
import { fileManager, regex } from '../utils'
=======
import { config, regex } from '../utils'
>>>>>>> main

export const appProcess = async ({ event, method, data }: ProcessArgs) => {
    switch (method) {
        case 'get-values':
<<<<<<< HEAD
            const dbUpdateTime = await fileManager.config.read('dbUpdateTime', false)
=======
            const dbUpdateTime = await config.read('dbUpdateTime', false)
>>>>>>> main
            event.reply('appData', { appVer: app.getVersion(), dbUpdateTime: regex.db2TimeToLocal(dbUpdateTime) })
            break
    }
} 