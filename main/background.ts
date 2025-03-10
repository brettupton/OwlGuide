require("dotenv").config()
import path from 'path'
<<<<<<< HEAD
import { app, ipcMain, dialog, BrowserWindow, shell, Tray, nativeImage } from 'electron'
import serve from 'electron-serve'
import { createWindow, createChildWindow, rightClickMenu } from './electron-utils'
import { bSQLDB, fileManager, paths, regex, logger } from './utils'
import { bookProcess, courseProcess, decisionProcess, enrollmentProcess, sqlProcess } from './processes'
import { initializeDB } from './processes/helpers/sqlDatabase'
import { appProcess } from './processes/app'
=======
import { app, ipcMain, dialog, BrowserWindow, shell } from 'electron'
import serve from 'electron-serve'
import { createWindow, createChildWindow, rightClickMenu, createTray } from './electron-utils'
import { bSQLDB, paths, regex, logger, config, createZipBlob } from './utils'
import { adoptionProcess, appProcess, bookProcess, courseProcess, decisionProcess, enrollmentProcess, orderProcess, reportProcess, sqlProcess } from './processes'
import { initializeDB } from './processes/helpers/sqlDatabase'
import { ChildPath, ChildWindow, ChildWindowLocation } from '../types/ChildWin'
import fs from 'fs'
>>>>>>> main

export const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
}

let mainWindow: BrowserWindow
let childWindows: ChildWindow[] = []

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

<<<<<<< HEAD
    tray = new Tray(nativeImage.createFromPath(paths.trayIconPath).resize({ width: 16 }))
    tray.setToolTip('OwlGuide')

    // Check app version to determine if database needs to be created/recreated
    const appVer = await fileManager.config.read('appVersion', false)
    if (isProd && appVer !== app.getVersion()) {
      try {
        await initializeDB()
        await fileManager.config.write('appVersion', app.getVersion(), false)
=======
    createTray(paths.windowIconPath)

    // Check app version to determine if database needs to be created/recreated
    const appVer = await config.read('appVersion', false)
    if (isProd && appVer !== app.getVersion()) {
      try {
        await initializeDB()
        await config.write('appVersion', app.getVersion(), false)
>>>>>>> main
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

ipcMain.on('close-child', async (event, { childId, promptClose }: { childId: string, promptClose: boolean }) => {
  if (childWindows.length > 0) {
    try {
      let child = childWindows.find((window) => window.id === childId)?.browserWin

      if (promptClose) {
        dialog.showMessageBox(child, {
          title: "Confirm",
          message: "Are you sure?",
          type: "question",
          buttons: ["No", "Yes"],
          defaultId: 0
        }).then(async (message) => {
          // Response is index of button pressed, ie "No" -> 0, "Yes" -> 1
          if (message.response) {
            event.reply('close-success')
            // Delay closing window so data has enough time to be sent to parent
            await new Promise((resolve) => setTimeout(resolve, 60))
            child.close()
            child = null

            // Remove window from array after close
            childWindows = childWindows.filter((window) => window.id !== childId)
          }
        })
      } else {
        // Clean up all child windows before resetting array
        childWindows.forEach((child) => {
          child.browserWin.close()
          child.browserWin = null
        })
        childWindows = []
      }
    } catch (error) {
      console.error(error)
      logger.addNewLog('error', ["close-child", childId, error])
      dialog.showErrorBox(`${childId}`, `${error}\n\nContact dev for assistance.`)
    }
  }
})

ipcMain.on('main', async (event, { process, method, data }: ProcessArgs) => {
  logger.addNewLog("main", [process, method, data?.["term"] ?? "", data?.["isbn"] ?? ""])

  try {
    switch (process) {
      case 'app':
        await appProcess({ event, method, data })
        break

<<<<<<< HEAD
=======
      case 'adoption':
        await adoptionProcess({ event, method, data })
        break

>>>>>>> main
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

<<<<<<< HEAD
=======
      case 'order':
        await orderProcess({ event, method, data })
        break

      case 'report':
        await reportProcess({ event, method, data })
        break

>>>>>>> main
      case 'sql':
        await sqlProcess({ event, method, data })
        break
    }
  } catch (error) {
    console.error(error)
    logger.addNewLog("error", [process, method, error])
    dialog.showErrorBox(`${process[0].toUpperCase() + process.slice(1)}`, `${error}\n\nContact dev for assistance.`)
<<<<<<< HEAD
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
=======
  }
})

ipcMain.on('dev', async (event, { method, data }: ProcessArgs) => {
  switch (method) {
    case 'open-user-dir':
      shell.openPath(paths.userDataPath)
      break

    case 'dump-files':
      try {
        const filesBlob = await createZipBlob()

        dialog.showSaveDialog({
          defaultPath: path.join(app.getPath('downloads'), `${regex.fileNameTimeStamp()}`),
          filters: [{ name: 'Zip File', extensions: ['zip'] }]
        })
          .then(async (result) => {
            if (!result.canceled && result.filePath) {
              fs.writeFile(result.filePath, Buffer.from(await filesBlob.arrayBuffer()), (err) => {
                if (err) {
                  throw new Error("Unable to write ZIP to selected path.")
                }
                event.reply('success')
              })
            }
          })
      } catch (error) {
        console.error(error)
        dialog.showErrorBox('Dev', `${error}`)
      }
      break
  }
})

ipcMain.on('window-sync', async (event, { fromWindow, process, data }) => {
  try {
    switch (process) {
      case 'adoption':
        // Find child window by ID and return window, if exists  
        const childName = "adoption-template"
        let child = childWindows.find((window) => window.id === childName)?.browserWin

        // Only create the child window if it doesn't exist from the main window
        if (fromWindow === "main" && !child) {
          const newChildWindow = await createChildWindow(mainWindow, "adoption-template", "detach")
          childWindows.push(newChildWindow)

          ipcMain.once('ready-to-receive', (event) => {
            event.reply('sync-data', { course: data["course"], term: data["term"] })
          })
        } else {
          const toWindow = fromWindow === "main" ? child : mainWindow

          toWindow.webContents.send('sync-data', { course: data["course"], term: data["term"] })
        }
        break
    }
  } catch (error) {
    console.error(error)
    logger.addNewLog('error', ["SYNC", process, error])
  }
})

ipcMain.on('child', async (event, { process, data }) => {
  let childName: ChildPath
  let childLocation: ChildWindowLocation
  let childData: {}

  try {
    // Set childName and childData based on process before opening child window
    switch (process) {
      case 'adoption':
        try {
          childName = "adoption-data"
          childLocation = "bottom"
          const [term, year] = regex.splitFullTerm(data["term"])

          childData = { prevAdoptions: await bSQLDB.adoptions.getPrevAdoptionsByCourse(year, data["course"]) }
        } catch (error) {
          throw error
>>>>>>> main
        }
        break

<<<<<<< HEAD
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
=======
      case 'course':
        try {
          childName = "course-data"
          childLocation = "bottom"
          const { booksResult, course } = await bSQLDB.books.getBooksByCourse(data["courseID"])

          childData = { books: booksResult, course }
        } catch (error) {
          throw error
        }
        break

      case 'decision':
        try {
          childName = "decision-data"
          childLocation = "right"
          const [term, year] = regex.splitFullTerm(data["term"])
          const salesHistory = await bSQLDB.sales.getPrevSalesByBook(data["bookId"], term, year)
          const courses = await bSQLDB.courses.getCoursesByBook(data["bookId"], term, year)

          childData = { salesHistory, courses, ISBN: data["ISBN"], Title: data["Title"] }
        } catch (error) {
          throw error
        }
        break

      case 'order':
        try {
          childName = "order-data"
          childLocation = "bottom"
          childData = { order: await bSQLDB.orders.getOrderByID(data["reqId"]) }
        } catch (error) {
          throw error
        }
        break
    }

    const childWindow = childWindows.find((window) => window.id === childName)?.browserWin

    // Create new child window and push to array if doesn't already exist
    if (!childWindow) {
      const newChildWindow = await createChildWindow(mainWindow, childName, childLocation)
      childWindows.push(newChildWindow)

      // Child sends ready event after initial render
      ipcMain.once('ready-to-receive', (event) => {
        event.reply('data', childData)
      })
    } else {
      childWindow.webContents.send('data', childData)
    }
  } catch (error) {
    console.error(error)
    logger.addNewLog("error", ["child", process, error])
>>>>>>> main
  }
})
