import { BrowserWindow, Menu, MenuItem, shell } from "electron"

export const rightClickMenu = (x: number, y: number, query: string, window: BrowserWindow) => {
    const contextMenu: Menu = Menu.buildFromTemplate([
        {
            label: 'Cut',
            role: 'cut'
        },
        {
            label: 'Copy',
            role: 'copy'
        },
        // TODO: Check if right-click on input element
        {
            label: 'Paste',
            role: 'paste'
        }
    ])
    const inspect = new MenuItem({
        label: 'Inspect Element',
        click: () => {
            window.webContents.inspectElement(x, y)
        }
    })
    const searchGoogle = new MenuItem({
        label: `Search Google for '${query}'`,
        click: () => {
            shell.openExternal(`https://www.google.com/search?q=${encodeURIComponent(query)}`)
        }
    })
    contextMenu.append(inspect)
    if (query) {
        contextMenu.append(searchGoogle)
    }

    return contextMenu
}