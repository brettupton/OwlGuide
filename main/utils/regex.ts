const matchFileName = (path: string): string => {
    // Finds file name from path, excludes file extension
    const match = path.match(/(?<=\\)([^\\]+)(?=\.[^.]*$)/)

    return match ? match[0] : ""
}

const matchFileTermYear = (path: string): string[] => {
    const fileName = matchFileName(path)
    // Finds term and year from file name, based on either F - Fall, W/Sp - Spring, A/Su - Summer
    const match = fileName.match(/(F|W|Sp|A|Su).*20(\d{2})/i)

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

export const regex = { matchFileName, matchFileTermYear, splitFullTerm }