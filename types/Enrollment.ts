export type IntermCourse = {
    Unit: string
    CRN: string
    Dept: string
    Course: string
    Section: string
    Prof: string
    Title: string
    EstEnrl: string
    ActEnrl: string
}

export type XLSXCourse = {
    COLLEGE: string
    DEPARTMENT: string
    SUBJECT: string
    'COURSE NUMBER': string
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
    UnitNumber: string
    Term: string
    Year: string
    DepartmentName: string
    CourseNumber: string
    SectionNumber: string
    ProfessorName: string
    MaximumCapacity: string
    EstPreEnrollment: string
    ActualEnrollment: string
    ContinuationClass: string
    EveningClass: string
    ExtensionClass: string
    TextnetFlag: string
    Location: string
    CourseTitle: string
    CourseID: string
}

export type BannerTerm = {
    code: string
    description: string
}

export interface BannerCourse {
    id: number
    term: string
    termDesc: string
    courseReferenceNumber: string
    partOfTerm: string
    courseNumber: string
    subject: string
    subjectDescription: string
    sequenceNumber: string
    campusDescription: string
    scheduleTypeDescription: string
    courseTitle: string
    creditHours: number
    maximumEnrollment: number
    enrollment: number
    seatsAvailable: number
    waitCapacity: number
    waitCount: number
    waitAvailable: number
    crossList: any
    crossListCapacity: any
    crossListCount: any
    crossListAvailable: any
    creditHourHigh: any
    creditHourLow: number
    creditHourIndicator: any
    openSection: boolean
    linkIdentifier: any
    isSectionLinked: boolean
    subjectCourse: string
    faculty: Faculty[]
    meetingsFaculty: MeetingsFaculty[]
    reservedSeatSummary: any
    sectionAttributes: SectionAttribute[]
    instructionalMethod: any
    instructionalMethodDescription: any
}

export interface Faculty {
    bannerId: string
    category: any
    class: string
    courseReferenceNumber: string
    displayName: string
    emailAddress: string
    primaryIndicator: boolean
    term: string
}

export interface MeetingsFaculty {
    category: string
    class: string
    courseReferenceNumber: string
    faculty: any[]
    meetingTime: MeetingTime
    term: string
}

export interface MeetingTime {
    beginTime: string
    building: string
    buildingDescription: string
    campus: string
    campusDescription: string
    category: string
    class: string
    courseReferenceNumber: string
    creditHourSession: number
    endDate: string
    endTime: string
    friday: boolean
    hoursWeek: number
    meetingScheduleType: string
    meetingType: string
    meetingTypeDescription: string
    monday: boolean
    room: string
    saturday: boolean
    startDate: string
    sunday: boolean
    term: string
    thursday: boolean
    tuesday: boolean
    wednesday: boolean
}

export interface SectionAttribute {
    class: string
    code: string
    courseReferenceNumber: string
    description: string
    isZTCAttribute: boolean
    termCode: string
}