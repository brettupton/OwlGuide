const { workerData, parentPort } = require('worker_threads')
const { exec } = require('child_process')

const { tableName, sqlStmt, userId, downloadDir } = workerData

const clientFile = `${downloadDir}/${tableName}.csv`
const acsExec = `"C:\\Users\\Public\\IBM\\ClientSolutions\\Start_Programs\\Windows_i386-32\\acslaunch_win-32.exe"`
const command = `${acsExec} /plugin=cldownload /userid=${userId} /system=${process.env.IBM_SYSTEM_HOST} /sql="${sqlStmt}" /clientfile="${clientFile}"`

// exec(command, (error, stdout, stderr) => {
//     if (error) {
//         throw new Error(`${stderr}`)
//     }
// })