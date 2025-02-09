require("dotenv").config()
import path from 'path'
import { app, ipcMain, dialog, BrowserWindow, shell, Tray, nativeImage } from 'electron'
import serve from 'electron-serve'
import { createWindow, createChildWindow, rightClickMenu } from './electron-utils'
import { bSQLDB, fileManager, paths, regex, logger } from './utils'
import { bookProcess, courseProcess, decisionProcess, enrollmentProcess, sqlProcess } from './processes'
import { initializeDB } from './processes/helpers/sqlDatabase'
import { appProcess } from './processes/app'

export const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
}

let mainWindow: BrowserWindow | undefined
let childWindow: BrowserWindow | undefined
let tray: Tray

  ; (async () => {
    await app.whenReady()

    mainWindow = createWindow('main', {
      width: 830,
      height: 630,
      icon: paths.windowIconPath,
      frame: false,
      titleBarStyle: 'hidden',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      },
    })

    tray = new Tray(nativeImage.createFromPath(paths.trayIconPath).resize({ width: 16 }))
    tray.setToolTip('OwlGuide')

    // Check app version to determine if database needs to be created/recreated
    const appVer = await fileManager.config.read('appVersion', false)
    if (isProd && appVer !== app.getVersion()) {
      try {
        await initializeDB()
        await fileManager.config.write('appVersion', app.getVersion(), false)
      } catch (error) {
        dialog.showErrorBox('Database Error', `${error}\n\nContact dev for assistance.`)
      }
    }

    await mainWindow.loadURL(isProd ? 'app://./home' : `http://localhost:${process.argv[2]}/home`)

    if (!isProd) {
      const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer')
      installExtension(REACT_DEVELOPER_TOOLS)
        .catch((err: Error) => console.log('An error occurred: ', err))
    }

  })()

app.on('window-all-closed', () => {
  app.quit()
})

// Header Processes
ipcMain.on('minimize-app', (event) => {
  const window = BrowserWindow.getFocusedWindow()
  if (window) window.minimize()
})

ipcMain.on('close-app', (event) => {
  const window = BrowserWindow.getFocusedWindow()
  if (window) window.close()
})

ipcMain.on('open-github', (event) => {
  shell.openExternal("https://github.com/brettupton/owlguide")
})

// Right Mouse Click Menu
ipcMain.on('context-menu', (event, { x, y, element, query }: { x: number, y: number, element: string, query: string }) => {
  const contextMenu = rightClickMenu(x, y, element, query, mainWindow)
  contextMenu.popup({ window: mainWindow })
})

ipcMain.on('close-child', () => {
  if (childWindow) {
    childWindow.close()
    childWindow = null
  }
})

ipcMain.on('main', async (event, { process, method, data }: ProcessArgs) => {
  logger.addNewLog("main", [process, method, data?.["term"] ?? "", data?.["isbn"] ?? ""])

  try {
    switch (process) {
      case 'app':
        await appProcess({ event, method, data })
        break

      case 'book':
        await bookProcess({ event, method, data })
        break

      case 'course':
        await courseProcess({ event, method, data })
        break

      case 'decision':
        await decisionProcess({ event, method, data })
        break

      case 'enrollment':
        await enrollmentProcess({ event, method, data })
        break

      case 'sql':
        await sqlProcess({ event, method, data })
        break
    }
  } catch (error) {
    console.error(error)
    logger.addNewLog("error", [process, method, error])
    dialog.showErrorBox(`${process[0].toUpperCase() + process.slice(1)}`, `${error}\n\nContact dev for assistance.`)
  }
})

ipcMain.on('dev', async (event, { method, data }: ProcessArgs) => {
  switch (method) {
    case 'open-user-dir':
      shell.openPath(paths.userDataPath)
      break
  }
})

ipcMain.on('child', async (event, { process, data }) => {
  switch (process) {
    case 'course':
      try {
        if (!childWindow) {
          childWindow = await createChildWindow(mainWindow, "course-data", "bottom")
        }

        const { booksResult, course } = await bSQLDB.books.getBooksByCourse(data.courseID)
        childWindow.webContents.send('data', { books: booksResult, course })
      } catch (error) {
        console.error(error)
        dialog.showErrorBox("Course", `${error}\n\nContact dev for assistance.`)
      }
      break

    case 'decision':
      try {
        if (!childWindow) {
          childWindow = await createChildWindow(mainWindow, "decision-data", "right")
        }

        const [term, year] = regex.splitFullTerm(data.term)
        const salesHistory = await bSQLDB.sales.getPrevSalesByBook(data.isbn, data.title, term, year)
        const courses = await bSQLDB.courses.getCoursesByBook(data.isbn, data.title, term, year)

        childWindow.webContents.send('data', { salesHistory, courses, isbn: data.isbn, title: data.title })
      } catch (error) {
        console.error(error)
        dialog.showErrorBox("Decision", `${error}\n\nContact dev for assistance.`)
      }
      break
  }
})
