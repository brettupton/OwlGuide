import fs from 'fs'

interface ReturnTXTData {
    fileData: string[]
    headerData: { [index: number]: string }
    term: string
}

export class TXTService {
    private filePath: string

    constructor(filePath: string) {
        this.filePath = filePath
    }

    public readFileData = (): Promise<ReturnTXTData> => {
        return new Promise((resolve, reject) => {
            fs.readFile(this.filePath, 'utf-8', (err, data) => {
                if (err) {
                    reject("Something went wrong reading TXT file.")
                }
                const lines = data.split("\n")

                // The term will always be at this line no matter the report
                const termLine = lines[7].trim()
                const term = termLine[termLine.length - 3]

                try {
                    const thirdIndex = this.getPageOneIndex(lines)
                    // Remove everything before third page 1 line and last two lines (*** End of Report *** and blank)
                    const fileData = lines.slice(thirdIndex + 1, lines.length - 2)
                    const headerData = this.getHeaderData(fileData)

                    // Find dash line - remove it, header and extraneous TA2 data
                    for (let i = 0; i < fileData.length; i++) {
                        if ((/^-+$/).test(fileData[i].trim())) {
                            const startIndex = Math.max(0, i - 5)
                            const endIndex = i + 1
                            fileData.splice(startIndex, endIndex - startIndex)
                            // Adjust the loop index to continue checking after the removed section
                            i = startIndex - 1
                        }
                    }

                    resolve({ fileData, headerData, term })
                } catch (err) {
                    reject(err)
                }
            })
        })
    }

    private getPageOneIndex = (lines: string[]) => {
        let pageOneCount = 0

        const pageOneIndex = lines.findIndex(line => {
            if (line.includes('Page: 1')) {
                pageOneCount++
                if (pageOneCount === 3) {
                    return true
                }
            }
            return false
        })

        if (pageOneIndex === -1) {
            throw new Error("Something went wrong getting the third page one index in the TXT file.")
        }

        return pageOneIndex
    }

    private getHeaderData = (data: string[]) => {
        let header: string

        for (let i = 0; i < data.length; i++) {
            if ((/^-+$/).test(data[i].trim())) {
                header = data[i - 1]
            }
        }

        if (!header) {
            throw new Error("Something went wrong getting header from TXT file.")
        }

        const headerTerms = header.trim().split(/\s+/)
        const indices: number[] = []

        for (let i = 0; i < headerTerms.length; i++) {
            const currTerm = headerTerms[i]
            indices.push(header.indexOf(currTerm))
        }

        const headerData = indices.reduce((acc, index, idx) => {
            acc[index] = headerTerms[idx]
            return acc
        }, {} as { [index: number]: string })

        return headerData
    }
}