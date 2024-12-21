const { Worker } = require('worker_threads')

export const newWorker = (workerPath: string, workerID: string, workerData): Promise<void> => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(workerPath, { workerData })

        worker.on('message', (message: string) => {
            console.log(`${workerID}: ${message}`)
        })

        worker.on('error', (error) => {
            reject(`${workerID} Unexpected ${error}`)
        })

        worker.on('exit', code => {
            if (code !== 0) {
                reject(`${workerID} exited with code ${code}.`)
            }
            resolve()
        })
    })
}