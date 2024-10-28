import { BrowserWindow } from "electron"
import path from 'path'

const childWindowURL = process.env.NODE_ENV === 'production' ? 'app://./child' : `http://localhost:${process.argv[2]}/child`

export const createChildWindow = async (mainWindow: BrowserWindow, childPath: string, location: "right" | "bottom") => {
  const mainBounds = mainWindow.getContentBounds()
  const windowWidth = location === "right" ? Math.floor(mainBounds.width * 0.4) : location === "bottom" ? Math.floor(mainBounds.width * 0.8) : 0
  const windowHeight = location === "right" ? mainBounds.height : location === "bottom" ? Math.floor(mainBounds.height * 0.3) : 0

  let childWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    frame: false,
    parent: mainWindow,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  await childWindow.loadURL(path.join(childWindowURL, childPath))

  // Move child window to position on first load
  updateChildWindowPos(mainWindow, childWindow, location)

  // Update child window location on move or resize of main window
  mainWindow.on('move', () => updateChildWindowPos(mainWindow, childWindow, location))
  mainWindow.on('resize', () => updateChildWindowPos(mainWindow, childWindow, location))

  // Clean up child window event listeners when closed
  childWindow.on('closed', () => {
    childWindow = null
    mainWindow.removeAllListeners('move')
    mainWindow.removeAllListeners('resize')
  })

  return childWindow
}

const updateChildWindowPos = (mainWindow: BrowserWindow, childWindow: BrowserWindow, location: "right" | "bottom") => {
  if (mainWindow && childWindow) {
    const mainBounds = mainWindow.getContentBounds()
    const childBounds = childWindow.getBounds()
    const childX = location === "right" ? mainBounds.x + (mainBounds.width - 4) : location === "bottom" ? mainBounds.x + 5 : 0
    const childY = location === "right" ? mainBounds.y : location === "bottom" ? mainBounds.y + (mainBounds.height - 9) : 0

    childWindow.setBounds({
      x: childX,
      y: childY,
      width: childBounds.width,
      height: childBounds.height
    })
  }
}