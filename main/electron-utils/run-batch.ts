import path from 'path'
import { exec, spawn } from 'child_process'

export const runBatchFile = (userId: string, resourcePath: string) => {
    const batchPath = path.join(__dirname, '../', 'main', 'db', 'download_tables.bat')
    const command = `"${batchPath}" "${userId}" "${resourcePath}"`

    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Execution error: ${error.message}`)
                reject(`Error executing batch file: ${error.message}`)
                return
            }
            if (stderr) {
                reject(`Batch file error: ${stderr}`)
                return
            }
            console.log(`Execution stdout: ${stdout}`)
            resolve(stdout)
        })
    })
}

export const runBatchSpawn = (userId: string, resourcePath: string): Promise<void> => {
    const batchPath = path.join(__dirname, '../', 'main', 'db', 'download_tables.bat')

    return new Promise((resolve, reject) => {
        const batchProcess = spawn(batchPath, [userId, resourcePath], { shell: true })
        batchProcess.stderr.on('data', (data) => {
            reject(`${data}`)
        })
        batchProcess.on('close', (code) => {
            if (code === 0) {
                resolve()
            } else {
                reject(`${code}`)
            }
        })
    })
}