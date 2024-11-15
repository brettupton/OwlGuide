import path from 'path'
import { app } from 'electron'

if (process.env.NODE_ENV !== 'production') {
    app.setPath('userData', `${app.getPath('userData')} (development)`)
}

const userData = app.getPath('userData')
const resourcePath = path.join(__dirname, '..', 'resources')

const paths = {
    userData: app.getPath('userData'),
    configPath: path.join(userData, 'config.json'),
    logPath: app.getPath('logs'),
    resourcePath: path.join(__dirname, '..', 'resources'),
    prodDBPath: path.join(process.resourcesPath, 'main/db/owlguide-2.db'),
    tablesPath: path.join(resourcePath, 'tables'),
    dbPath: process.env.NODE_ENV !== 'production' ? path.join(__dirname, '..', 'main', 'db', 'owlguide-2.db') : path.join(app.getPath('userData'), 'db/owlguide-2.db')
}

export default paths