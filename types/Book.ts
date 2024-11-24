export type BookResult = {
    ID: number
    ISBN: string
    Title: string
    Subtitle: string
    AuthorLast: string
    Author: string
    Edition: string
    Vendor: string
    Publisher: string
    Image: string
    Terms: string[]
}

export type APIResult = {
    ISBN: string
    Title: string
    Subtitle: string
    Author: string
    PrevImg: string
}

export type GVolInfo = {
    "title": string
    "subtitle": string
    "authors": string[]
    "publisher": string
    "publishedDate": string
    "description": string
    "industryIdentifiers": {
        "type": string
        "identifier": string
    }[]
    "readingModes": {
        "text": boolean
        "image": boolean
    }
    "pageCount": number
    "printType": string
    "categories": string[]
    "maturityRating": string,
    "allowAnonLogging": boolean
    "contentVersion": string
    "panelizationSummary": {
        "containsEpubBubbles": boolean
        "containsImageBubbles": boolean
    }
    "imageLinks": {
        "smallThumbnail": string
        "thumbnail": string
    }
    "language": string
    "previewLink": string
    "infoLink": string
    "canonicalVolumeLink": string
}