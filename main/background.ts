import path from 'path'
import fs from 'fs'
import { app, ipcMain, dialog, BrowserWindow, shell, Tray, nativeImage } from 'electron'
import serve from 'electron-serve'
import { createWindow, createChildWindow, rightClickMenu } from './electron-utils'
import { regex, fileManager, bSQLDB } from './utils'
import { matchEnrollment, submitEnrollment } from './processes/enrollment'
import { getTermDecisions, getFileDecisions } from './processes/decision'
import { dropTables, initializeDB, replaceTables } from './processes/sql'
import { runBatchSpawn } from './electron-utils/run-batch'
import paths from './utils/paths'

const isProd = process.env.NODE_ENV === 'production'

const iconPath = path.join(__dirname, '..', 'resources', 'owl.ico')
const appHomeURL = isProd ? 'app://./home' : `http://localhost:${process.argv[2]}/home`

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
      icon: iconPath,
      frame: false,
      titleBarStyle: 'hidden',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      },
    })

    // Tray
    const icon = nativeImage.createFromPath(iconPath)
    tray = new Tray(icon)
    tray.setToolTip('OwlGuide')

    await mainWindow.loadURL(appHomeURL)

    if (!isProd) {
      // Load React DevTools only if in development
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
  if (isProd) {
    try {
      await initializeDB()
    } catch (error) {
      dialog.showMessageBox(mainWindow, { type: "info", title: "OwlGuide", message: `${error}\n\nContact dev for assistance.` })
    }
  }
  event.reply('initialize-success', { isDev: !isProd, appVer: app.getVersion(), console: paths })
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
ipcMain.on('context-menu', (event, { x, y, query }: { x: number, y: number, query: string }) => {
  const contextMenu = rightClickMenu(x, y, query, mainWindow)
  contextMenu.popup({ window: mainWindow })
})

ipcMain.on('close-child', () => {
  if (childWindow) {
    childWindow.close()
    childWindow = null
  }
})

ipcMain.on('config', async (event, { method, data }) => {
  switch (method) {
    case 'update':
      try {
        const key = Object.keys(data)[0]
        const value = data[key]

        await fileManager.config.write(key, value)
      } catch (error) {
        console.error(error)
        dialog.showErrorBox("Config", `${error}\n\nContact dev for assistance.`)
      }
      break

    case 'get':
      try {
        const username = await fileManager.config.read(data)
        console.log(username)
      } catch (error) {
        console.error(error)
        dialog.showErrorBox("Config", `${error}\n\nContact dev for assistance.`)
      }
      break
  }
})

ipcMain.on('enrollment', async (event, { method, data }) => {
  switch (method) {
    case 'file-upload':
      try {
        const { enrollment, filePath } = await matchEnrollment(data[0])
        event.reply('enrollment-data', { enrollment, filePath })
      } catch (error) {
        console.error(error)
        dialog.showErrorBox("Enrollment", `${error}\n\nContact dev for assistance.`)
        event.reply('file-error')
      }
      break

    case 'file-download':
      try {
        const { fileName, csv } = await submitEnrollment(data.enrollment, data.filePath)

        dialog.showSaveDialog({
          defaultPath: path.join(app.getPath('downloads'), `${fileName}_Formatted`),
          filters: [{ name: 'CSV Files', extensions: ['csv'] }]
        })
          .then(async (result) => {
            if (!result.canceled && result.filePath) {
              fs.writeFile(result.filePath, csv, (err) => {
                if (err) {
                  throw Error("Couldn't write CSV to selected path.")
                }
                event.reply('enrl-success')
              })
            }
          })
      } catch (error) {
        console.error(error)
        dialog.showErrorBox("Enrollment", `${error}\n\nContact dev for assistance.`)
      }
      break
  }
})

ipcMain.on('sql', async (event, { method, data }) => {
  switch (method) {
    case "get-table-page":
      try {
        const { queryResult, totalRowCount } = await bSQLDB.all.getTablePage(data.name, data.offset, data.limit)
        event.reply('table-page', { rows: queryResult, total: totalRowCount })
      } catch (error) {
        console.error(error)
        dialog.showErrorBox("SQL", `Check the console.`)
      }
      break

    case "get-terms":
      try {
        const terms = await bSQLDB.all.getAllTerms()
        event.reply("term-list", { terms: terms.map((term) => term.Term) })
      } catch (error) {
        console.error(error)
        dialog.showErrorBox("SQL", `Check the console.`)
      }
      break

    case "replace-table":
      console.log("Replacing tables.")
      const files = data as string[]

      console.time('SQL')
      await replaceTables(files)
      console.timeEnd('SQL')
      break

    case "drop-table":
      try {
        console.log(`Recreating tables`)

        console.time('SQL')
        await dropTables()
        console.timeEnd('SQL')
      } catch (error) {
        console.error(error)
      }
      break
  }
})

ipcMain.on('decision', async (event, { method, data }) => {
  switch (method) {
    case 'file-upload':
      try {
        const { decisions, term } = await getFileDecisions(data[0])
        event.reply('decision-data', { decisions, term })
      } catch (error) {
        console.error(error)
        dialog.showErrorBox("Decision", `${error}\n\nContact dev for assistance.`)
        event.reply('file-error')
      }
      break

    case "get-term-decision":
      try {
        const { decisions, term } = await getTermDecisions(data.term)
        event.reply('decision-data', { decisions, term })
      } catch (error) {
        console.error(error)
        dialog.showErrorBox("Decision", `${error}\n\nContact dev for assistance.`)
        event.reply('decision-data', [])
      }
      break

    case "child-decision":
      try {
        if (!childWindow) {
          childWindow = await createChildWindow(mainWindow, "decision-data", "right")
        }

        const [term, year] = data.term.match(/[a-zA-z]|\d+/g)
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

ipcMain.on('course', async (event, { method, data }) => {
  switch (method) {
    case 'get-term-course':
      try {
        const [term, year] = regex.splitFullTerm(data.term)
        const { queryResult, totalRowCount } = await bSQLDB.courses.getCoursesByTerm(term, year, data.limit, data.lastCourse)

        event.reply('course-data', { courses: queryResult, total: totalRowCount, term: term + year })
      } catch (error) {
        console.error(error)
        dialog.showErrorBox("Course", `${error}\n\nContact dev for assistance.`)
      }
      break

    case 'child-course':
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
  }
})
