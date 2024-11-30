import path from 'path'
import { app } from 'electron'

const isProd = process.env.NODE_ENV === 'production'

if (!isProd) {
    app.setPath('userData', `${app.getPath('userData')} (development)`)
}

const userData = app.getPath('userData')

export const paths = {
    userDataPath: app.getPath('userData'),
    configPath: path.join(userData, 'config.json'),
    logPath: app.getPath('logs'),
    dbPath: !isProd ? path.join(__dirname, '..', 'main', 'db/owlguide-2.db') : path.join(app.getPath('userData'), 'db/owlguide-2.db'),
    extraResourceDbPath: path.join(process.resourcesPath, 'main/db/owlguide-2.db')
}