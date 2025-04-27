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

const splitFullTermDesc = (fullTerm: string): string[] => {
    const splitTerm = fullTerm.split(/\s/gm)
    const term = splitTerm[0].slice(0, 2) === "Sp" ? "W" : splitTerm[0].slice(0, 2) === "Su" ? "A" : "F"
    const year = splitTerm[1].replace("(View Only)", "").slice(-2)

    return [term, year]
}

const usedBarcodeToISBN = (isbn: string | number) => {
    let newISBN = isbn.toString()

    if (/^290/g.test(newISBN)) {
        newISBN = newISBN.replace(/^290/g, '978')
        newISBN = newISBN.slice(0, 12) + ((parseInt(newISBN.slice(-1)) + 1) % 10)
    }

    return newISBN
}

const formatSearchISBN = (reqISBN: string) => {
    // Remove all hyphens
    let formattedISBN = usedBarcodeToISBN(reqISBN.replace(/-/g, ''))

    // Normalize to 12-digit ISBN-13 base (no check digit)
    if (formattedISBN.length === 10) {
        // ISBN-10: Remove check digit and prepend '978'
        formattedISBN = "978" + formattedISBN.slice(0, -1)
    } else if (formattedISBN.length === 13) {
        // Assume it's full ISBN-13; strip check digit
        formattedISBN = formattedISBN.slice(0, -1)
    } else if (formattedISBN.length === 12) {
        // Already a 12-digit ISBN-13 base — fine
    } else {
        throw new Error("Invalid ISBN format")
    }

    // Calculate ISBN-13 check digit
    let checkSum = 0
    for (let i = 0; i < formattedISBN.length; i++) {
        const digit = parseInt(formattedISBN[i])
        const weight = i % 2 === 0 ? 1 : 3
        checkSum += digit * weight
    }

    const checkDigit = (10 - (checkSum % 10)) % 10

    return formattedISBN + checkDigit
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

const getFacultyLastName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/)
    if (parts.length === 1) {
        return parts[0].toUpperCase() // Only one name
    } else if (parts.length === 2) {
        return parts[1].toUpperCase() // Only last name
    } else {
        return parts.slice(-2).join(' ').toUpperCase() // Last two names
    }
}

const decodeHTMLEntities = (html: string) => {
    return html.replace(/&[a-zA-Z0-9#]+;/g, match => {
        switch (match) {
            case '&amp;': return '&'
            case '&lt;': return '<'
            case '&gt;': return '>'
            case '&quot;': return '"'
            case '&#39;': return "'"
            default: return match // Leave unknown entities alone
        }
    })
}

const db2TimeToLocal = (db2: string) => {
    // Convert IBM Db2 timestamp to ISO (YYYY-MM-DDTHH:mm:ssZ) to convert to Date string
    const iso = db2.substring(0, db2.lastIndexOf('-')) + 'T' + db2.substring(db2.lastIndexOf('-') + 1).slice(0, 8).replace(/[\.]/g, ':') + 'Z'
    return new Date(iso).toLocaleString()
}

<<<<<<< HEAD
const db2TimeToLocal = (db2: string) => {
    // Convert IBM Db2 timestamp to ISO (YYYY-MM-DDTHH:mm:ssZ) to convert to Date string
    const iso = db2.substring(0, db2.lastIndexOf('-')) + 'T' + db2.substring(db2.lastIndexOf('-') + 1).slice(0, 8).replace(/[\.]/g, ':') + 'Z'
    return new Date(iso).toLocaleString()
}

=======
>>>>>>> main
const ISOtoDb2Time = (iso: string) => {
    return iso.replace('T', '-').replace(/:/g, '.').replace('Z', '').slice(0, 26) + '000'
}

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> main
=======
>>>>>>> main
=======
>>>>>>> main
const fileNameTimeStamp = () => {
    // Construct filesafe timestamp string in MMDDYYTHHMMSSMSZ format
    const now = new Date()

    return `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${now.getFullYear().toString().slice(-2)}`
        + `T${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}-${now.getMilliseconds()}Z`
}

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
=======
>>>>>>> main
=======
>>>>>>> main
export const regex = {
    matchFileName,
    matchFileTermYear,
    splitFullTerm,
<<<<<<< HEAD
    createSearchISBN,
    toProperCase,
    usedBarcodeToISBN,
    db2TimeToLocal,
<<<<<<< HEAD
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
=======
    ISOtoDb2Time,
    fileNameTimeStamp
>>>>>>> main
=======
    splitFullTermDesc,
    formatSearchISBN,
    toProperCase,
    decodeHTMLEntities,
    getFacultyLastName,
    usedBarcodeToISBN,
    db2TimeToLocal,
    ISOtoDb2Time,
    fileNameTimeStamp
>>>>>>> main
}