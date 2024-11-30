import { BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions, shell } from "electron"

export const rightClickMenu = (x: number, y: number, element: string, query: string, window: BrowserWindow) => {
    const templateArr: (MenuItem | MenuItemConstructorOptions)[] = [
        {
            label: 'Copy',
            role: 'copy'
        }
    ]
    if (element === "INPUT") {
        templateArr.unshift(
            {
                label: 'Cut',
                role: 'cut'
            }
        )
        templateArr.push(
            {
                label: 'Paste',
                role: 'paste'
            }
        )
    }
    if (query) {
        templateArr.push(
            {
                label: `Search Google for '${query}'`,
                click: () => {
                    shell.openExternal(`https://www.google.com/search?q=${encodeURIComponent(query)}`)
                }
            }
        )
    }

    const contextMenu: Menu = Menu.buildFromTemplate(templateArr)
    // const inspect = new MenuItem({
    //     label: 'Inspect Element',
    //     click: () => {
    //         window.webContents.inspectElement(x, y)
    //     }
    // })

    return contextMenu
}