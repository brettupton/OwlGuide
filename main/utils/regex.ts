const matchFileName = (path: string): string => {
    // Finds file name from path, excludes file extension
    const match = path.match(/(?<=\\)([^\\]+)(?=\.[^.]*$)/)

    return match ? match[0] : ""
}

const matchFileTermYear = (path: string): string[] => {
    const fileName = matchFileName(path)
    // Finds term and year from file name, based on either F - Fall, W/Sp - Spring, A/Su - Summer
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
            } else if (/^[a-zA-Z]/.test(part)) {
                // Handle possessives
                return part.replace(/(\w+)'?S$/, (match, word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() + "'s"
                )
            }
            // Leave other parts (symbols, etc.) unchanged
            return part
        })
        .join('')
}

export const regex = { matchFileName, matchFileTermYear, splitFullTerm, createSearchISBN, toProperCase }