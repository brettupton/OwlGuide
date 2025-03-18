const matchFileName = (path: string): string => {
    // Finds file name from path, excludes file extension
    const match = path.match(/(?<=\\)([^\\]+)(?=\.[^.]*$)/)

    return match ? match[0] : ""
}

const matchFileTermYear = (path: string): string[] => {
    const fileName = matchFileName(path)
    // Finds term and year from file name, based on either F -> Fall, W/Sp -> Spring, A/Su -> Summer
    const match = fileName.match(/(F|W|Sp|A|Su).*?20(\d{2})/i)

    if (match) {
        match[1] = match[1] === "Sp" ? "W" : match[1] === "Su" ? "A" : match[1]
    }

    return match ? match.slice(1, 3) : []
}

const splitFullTerm = (fullTerm: string): string[] => {
    // Ex. F24 -> F 24
    const match = fullTerm.match(/\d{2}|\w/g)

    return match ? match.slice(0, 2) : []
}

const createSearchISBN = (ISBN: string) => {
    // Removes hyphens, first three digits, and last digit for searching any user inputted ISBN
    let search = ISBN
        .replace(/\-/g, '')
        .replace(/^(978|290)/g, '')
        .slice(0, -1)

    return search
}

const toProperCase = (str: string | number) => {
    return str.toString()
        .split(/([^\w]+)/)
        .map(part => {
            if (/^\d+[A-Za-z]+$/.test(part)) {
                // Handle ordinal numbers
                return part.replace(/(\d+)([A-Za-z]+)/, (match, number, suffix) =>
                    number + suffix.toLowerCase()
                )
            } else if (/(\w+)'S$/i.test(part)) {
                // Handle possessives
                return part.replace(/(\w+)'?S$/, (match, word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() + "'s"
                )
            } else if (/^[a-zA-Z]/.test(part)) {
                // Default
                return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            }
            // Leave symbols
            return part
        })
        .join('')
}

const toISBN10 = (ISBN: string | number) => {
    const base = ISBN.toString().replace(/-/g, '').slice(3, 12)
    let checkSum = 0

    for (let i = 10; i >= 2; i--) {
        const currDigit = Math.abs(i - 10)
        const prod = i * parseInt(base[currDigit])
        checkSum += prod
    }

    const remainder = checkSum % 11
    const checkDigit = 11 - remainder
    return base + checkDigit
}

const toISBN13 = (ISBN: string | number) => {
    const base = "978" + ISBN.toString().replace(/-/g, '').slice(0, 9)
    let checkSum = 0
    let weightAdd = 1

    for (let i = 0; i < base.length; i++) {
        const currWeight = (i + weightAdd) % 4
        const prod = parseInt(base[i]) * currWeight
        checkSum += prod
        weightAdd += 1
    }

    const remainder = checkSum % 10
    const checkDigit = 10 - remainder

    return base + checkDigit
}

const usedBarcodeToISBN = (isbn: string | number) => {
    let newISBN = isbn.toString()

    if (/^290/g.test(newISBN)) {
        newISBN = newISBN.replace(/^290/g, '978')
        newISBN = newISBN.slice(0, 12) + ((parseInt(newISBN.slice(-1)) + 1) % 10)
    }

    return newISBN
}

const db2TimeToLocal = (db2: string) => {
    // Convert IBM Db2 timestamp to ISO (YYYY-MM-DDTHH:mm:ssZ) to convert to Date string
    const iso = db2.substring(0, db2.lastIndexOf('-')) + 'T' + db2.substring(db2.lastIndexOf('-') + 1).slice(0, 8).replace(/[\.]/g, ':') + 'Z'
    return new Date(iso).toLocaleString()
}

const ISOtoDb2Time = (iso: string) => {
    return iso.replace('T', '-').replace(/:/g, '.').replace('Z', '').slice(0, 26) + '000'
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> main
const fileNameTimeStamp = () => {
    // Construct filesafe timestamp string in MMDDYYTHHMMSSMSZ format
    const now = new Date()

    return `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${now.getFullYear().toString().slice(-2)}`
        + `T${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}-${now.getMilliseconds()}Z`
}

<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
export const regex = {
    matchFileName,
    matchFileTermYear,
    splitFullTerm,
    createSearchISBN,
    toProperCase,
    usedBarcodeToISBN,
    db2TimeToLocal,
<<<<<<< HEAD
<<<<<<< HEAD
    ISOtoDb2Time
=======
    ISOtoDb2Time,
    fileNameTimeStamp
>>>>>>> main
=======
    ISOtoDb2Time,
    fileNameTimeStamp
>>>>>>> main
}