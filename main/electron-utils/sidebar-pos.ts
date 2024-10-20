import { BrowserWindow } from "electron"

export const updateSidebarPosition = (mainWindow: BrowserWindow, sidebarWindow: BrowserWindow) => {
  if (mainWindow && sidebarWindow) {
    const mainBounds = mainWindow.getContentBounds()
    const sidebarBounds = sidebarWindow.getBounds()

    const sidebarX = mainBounds.x + mainBounds.width
    const sidebarY = mainBounds.y

    sidebarWindow.setBounds({
      x: sidebarX,
      y: sidebarY,
      width: sidebarBounds.width,
      height: sidebarBounds.height
    })
  }
}

export const updateBottomBarPosition = (mainWindow: BrowserWindow, bottomBar: BrowserWindow) => {
  if (mainWindow && bottomBar) {
    const mainBounds = mainWindow.getBounds()
    bottomBar.setBounds({
      x: mainBounds.x + 5,
      y: mainBounds.y + (mainBounds.height - 9),
      width: mainBounds.width - 9,
      height: mainBounds.height * (1 / 3)
    })
  }
}