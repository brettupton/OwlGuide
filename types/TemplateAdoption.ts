export type TemplateAdoption = {
    Course: string
    Title: string
    ISBN: string
    ID: string
    noText: boolean
}

export type AdoptionCSV = {
    'CampusName': string
    'TermTitle': string
    'SectionCode': string
    'ISBN': number
    'SKU-First Day Sections Only': null
    'AdoptionCondition ( Non-First Day Sections Only)': string | null
    'AdoptionType ( Non-First Day Sections Only)': string | null
    'Notes': null
    'NoMaterials ( Non-First Day Sections Only "Y/N")': string
}