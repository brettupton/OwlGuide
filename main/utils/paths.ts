import path from 'path'
import { app } from 'electron'

if (process.env.NODE_ENV !== 'production') {
    app.setPath('userData', `${app.getPath('userData')} (development)`)
}

const userData = app.getPath('userData')
const configPath = path.join(userData, 'config.json')
const logPath = app.getPath('logs')

export { userData, configPath, logPath }