import { app } from 'electron'
import { fileManager, regex } from '../utils'

export const appProcess = async ({ event, method, data }: ProcessArgs) => {
    switch (method) {
        case 'get-values':
            const dbUpdateTime = await fileManager.config.read('lastDBUpdate', false)
            event.reply('appData', { appVer: app.getVersion(), lastDBUpdate: regex.db2TimeToLocal(dbUpdateTime) })
            break
    }
} 