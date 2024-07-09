type EditionDoc = {
    key: string
    title: string
    author_name: string[]
    publisher: string[]
    publish_date: string[]
}

type Edition = {
    numFound: number
    start: number
    numFoundExact: boolean
    docs: EditionDoc[]
}

type LibraryDoc = {
    author_name: string[]
    key: string
    number_of_pages_median: number
    publish_date: string[]
    publisher: string[]
    title: string
    editions: Edition
}

type LibraryData = {
    numFound: number
    start: number
    numFoundExact: boolean
    docs: LibraryDoc[]
    num_found: number
    q: string
    offset: null
}

type LibraryResponse = {
    data: LibraryData
}

export default LibraryResponse