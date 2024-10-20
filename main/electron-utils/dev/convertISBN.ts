export const convertISBN13to10 = (ISBN: string): string => {
    const noDash = ISBN.replace(/-/g, '')
    const base = noDash.slice(3, 12)
    let checkSum = 0

    for (let i = 10; i >= 2; i--) {
        const currDigit = Math.abs(i - 10)
        const prod = i * parseInt(base[currDigit])
        checkSum += prod
    }

    const remainder = checkSum % 11
    const checkDigit = (11 - remainder).toString()
    return base + checkDigit
}

const convertISBN10to13 = (ISBN: string): string => {
    const noDash = ISBN.replace(/-/g, '')
    const base = "978" + noDash.slice(0, 9)
    let checkSum = 0
    let weightAdd = 1

    for (let i = 0; i < base.length; i++) {
        const currWeight = (i + weightAdd) % 4
        const prod = parseInt(base[i]) * currWeight
        checkSum += prod
        weightAdd += 1
    }

    const remainder = checkSum % 10
    const checkDigit = (10 - remainder).toString()

    return base + checkDigit
}