import path from 'path'
import { app, ipcMain, dialog, BrowserWindow, shell, Tray, nativeImage } from 'electron'
import serve from 'electron-serve'
import { createWindow, createChildWindow, rightClickMenu } from './electron-utils'
import { bSQLDB, fileManager, paths, regex } from './utils'
import { bookProcess, courseProcess, decisionProcess, enrollmentProcess, sqlProcess } from './processes'
import { getIBMTables, initializeDB } from './processes/helpers/sqlDatabase'
import { logger } from './utils/logger'

const isProd = process.env.NODE_ENV === 'production'
let dbLoaded = false

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
      icon: paths.iconPath,
      frame: false,
      titleBarStyle: 'hidden',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      },
    })

    // Tray Icon
    tray = new Tray(nativeImage.createFromPath(paths.iconPath).resize({ width: 16 }))
    tray.setToolTip('OwlGuide')

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

// On app initialization, copy DB to read-write directory
ipcMain.on('initialize', async (event) => {
  if (isProd && !dbLoaded) {
    try {
      await initializeDB()
      dbLoaded = true
    } catch (error) {
      dialog.showMessageBox(mainWindow, { type: "info", title: "OwlGuide", message: `${error}\n\nContact dev for assistance.` })
    }
  }
  event.reply('initialize-success', { isDev: !isProd, appVer: app.getVersion() })
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
  logger.newLog({ logType: 'main-event', process, method, term: (data && data['term'] as string) ?? '' })

  try {
    switch (process) {
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
    logger.newLog({ logType: 'main-error', process, method, text: `${error}` })
    dialog.showErrorBox(`${process[0].toUpperCase() + process.slice(1)}`, `${error}\n\nContact dev for assistance.`)
  }
})

ipcMain.on('worker', async (event) => {
  try {
    console.log(await getIBMTables('1234'))
  } catch (error) {
    console.error(error)
  }
})

ipcMain.on('config', async (event, { method, data }) => {
  switch (method) {
    case 'write':
      try {
        await fileManager.config.write(data.key, data.value, true)
        console.log("Write Success")
      } catch (error) {
        console.error(error)
      }
      break

    case 'read':
      try {
        const configValue = await fileManager.config.read(data.key, true)
        console.log(configValue)
      } catch (error) {
        console.error(error)
      }
      break

    case 'delete':
      try {
        await fileManager.config.delete(data.key)
        console.log("Delete Success")
      } catch (error) {
        console.error(error)
      }
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
