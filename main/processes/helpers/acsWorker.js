const { workerData, parentPort } = require('worker_threads')
const { exec } = require('child_process')

const { table, userId, downloadDir } = workerData

const clientFile = `${downloadDir}/${table}.csv`
const sql = `SELECT * FROM T2DB00622.${table}`
const baseCommand = `"C:\\Users\\Public\\IBM\\ClientSolutions\\Start_Programs\\Windows_i386-32\\acslaunch_win-32.exe"`
const command = `${baseCommand} /plugin=cldownload /userid=${userId} /system=STORES01.BNCOLLEGE.COM /sql="${sql}" /clientfile="${clientFile}"`

// exec(command, (error, stdout, stderr) => {
//     if (error) {
//         throw new Error(`${stderr}`)
//     }
// })

// Test worker
setTimeout(() => {
    const isSuccess = Math.random() > 0.5

    if (!isSuccess) {
        throw new Error(`Failed processing`)
    }
}, 15000)