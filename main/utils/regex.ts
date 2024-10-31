const matchFileName = (path: string): string => {
    // Finds file name from path, excludes file extension
    const match = path.match(/(?<=\\)([^\\]+)(?=\.[^.]*$)/)

    return match ? match[0] : ""
}

const matchTermYear = (path: string): string[] => {
    const fileName = matchFileName(path)
    // Finds term and year from file name, based on either F - Fall, W/Sp - Spring, A/Su - Summer
    const match = fileName.match(/(F|W|Sp|A|Su).*20(\d{2})/i)

    if (match) {
        match[1] = match[1] === "Sp" ? "W" : match[1] === "Su" ? "A" : match[1]
    }

    return match ? match.slice(1, 3) : []
}

export const regex = { matchFileName, matchTermYear }