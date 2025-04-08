const LibraryReport = {
    Title: "",
    ISBN: "",
    Str: "",
    Dept: "",
    Course: "",
    Section: "",
    Prof: "",
    Author: "",
    Edition: "",
    Publisher: ""
}

const ReconReport = {
    Dept: "",
    Course: "",
    Section: "",
    Title: "",
    ISBN: "",
    NewOH: "",
    NewRsvd: "",
    UsedOH: "",
    UsedRsvd: "",
    CXL: ""
}

const OpenToBuyReport = {
    ISBN: "",
    Title: "",
    Publisher: "",
    EstSales: "",
    Ordered: "",
    OnHand: "",
    Reserved: "",
    OTB: ""
}

export const reportMap = {
    libr: LibraryReport,
    recon: ReconReport,
    otb: OpenToBuyReport
}