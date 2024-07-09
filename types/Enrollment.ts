export type XLSXCourse = {
    COLLEGE: string
    DEPARTMENT: string
    SUBJECT: string
    'COURSE NUMBER': number
    TITLE: string
    'OFFERING NUMBER'?: string
    'PRIMARY INSTRUCTOR LAST NAME'?: string
    'PRIMARY INSTRUCTOR FIRST NAME'?: string
    'EMAIL PREFERRED ADDRESS?': string
    'TARGET ENROLLMENT': number
    'ACTUAL ENROLLMENT': number
    'MAXIMUM ENROLLMENT': number
    'COURSE REFERENCE NUMBER': number
    'START DATE': number
    'END DATE': number
    CAMPUS: string
}

export type CSVCourse = {
    "UnitNumber": string
    "Term": string
    "Year": string
    "DepartmentName": string
    "CourseNumber": string
    "SectionNumber": string
    "ProfessorName": string
    "MaximumCapacity": string
    "EstPreEnrollment": string
    "ActualEnrollment": string
    "ContinuationClass": string
    "EveningClass": string
    "ExtensionClass": string
    "TextnetFlag": string
    "Location": string
    "CourseTitle": string,
    "CourseID": string
}