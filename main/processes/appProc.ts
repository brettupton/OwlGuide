import { app } from 'electron'
import { config, regex } from '../utils'

export const appProcess = async ({ event, method, data }: ProcessArgs) => {
    switch (method) {
        case 'get-values':
            const dbUpdateTime = await config.read('dbUpdateTime', false)
            event.reply('appData', { appVer: app.getVersion(), dbUpdateTime: regex.db2TimeToLocal(dbUpdateTime) })
            break
    }
} 