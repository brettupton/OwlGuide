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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    tempPath: path.join(userData, 'tmp'),
=======
    tempPath: path.join(userData, 'temp'),
>>>>>>> main
=======
    tempPath: path.join(userData, 'temp'),
>>>>>>> main
=======
    tempPath: path.join(userData, 'temp'),
>>>>>>> main
    dbPath: !isProd ? path.join(app.getAppPath(), 'main', 'db/owlguide.db') : path.join(app.getPath('userData'), 'db/owlguide.db'),
    windowIconPath: path.join(app.getAppPath(), 'renderer', 'public', 'images', 'owl.ico'),
    trayIconPath: path.join(process.resourcesPath, 'images', 'owl.png')
}