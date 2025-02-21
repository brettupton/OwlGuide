export type PurchaseOrder = {
    ID: number
    Number: number
    Vendor: string
    CreatedOn: string
    Status: string
    SentBy: string
    Sent: "Y" | "N"
    NumItemsOrd: number
    NumItemsRcvd: number
    QtyItemsOrd: number
    QtyItemsRvcd: number
}

export type OrderInfo = {
    ISBN: string
    Title: string
    "Cond.": "NW" | "US"
    Ordered: number
    Received: number
    UnitPrice: number
    Discount: number
}