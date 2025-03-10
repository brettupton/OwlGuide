import { BrowserWindow } from "electron"

export type ChildWindow = { id: ChildPath, browserWin: BrowserWindow }
export type ChildWindowLocation = "right" | "bottom" | "detach"
export type ChildPath = "adoption-template" | "adoption-data" | "course-data" | "decision-data" | "order-data"