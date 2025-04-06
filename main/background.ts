require("dotenv").config()
import path from 'path'
import { app, ipcMain, dialog, BrowserWindow, shell } from 'electron'
import serve from 'electron-serve'
import { createWindow, createChildWindow, rightClickMenu, createTray, initializeApp, downloadFiles } from './electron-utils'
import { bSQLDB, paths, regex, logger, createZipBlob } from './utils'
import { adoptionProcess, appProcess, bookProcess, courseProcess, decisionProcess, enrollmentProcess, orderProcess, reportProcess, sqlProcess } from './processes'
import { ChildPath, ChildWindow, ChildWindowLocation } from '../types/ChildWin'
import { formatPrevAdoptions } from './processes/helpers/adoptConv'
import { PrevAdoption } from '../types/Adoption'

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

    if (isProd) {
      try {
        await initializeApp()
        createTray(paths.trayIconPath)
      } catch (error) {
        dialog.showErrorBox('App', `${error}\n\nContact dev for assistance.`)
      }
    } else {
      const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer')
      installExtension(REACT_DEVELOPER_TOOLS)
        .catch((err: Error) => console.log('An error occurred: ', err))
    }

    await mainWindow.loadURL(isProd ? 'app://./home' : `http://localhost:${process.argv[2]}/home`)
  })()

app.on('window-all-closed', () => {
  app.quit()
})

// Header Processes
ipcMain.on('minimize-app', (event) => {
  if (mainWindow) mainWindow.minimize()
})

ipcMain.on('close-app', (event) => {
  if (childWindows && childWindows.length > 0) {
    // Close all windows safely
    childWindows.forEach((windowObj) => {
      if (windowObj && !windowObj.browserWin.isDestroyed()) {
        windowObj.browserWin.close()
      }
    })
    // After all closed, clear the list
    childWindows = []
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close()
  }
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
  // Include both term and isbn for specific processes to log
  const logInfo = [["adoption", "course", "decision", "order"].includes(data.type) ? data["term"] : "", data.type === "book" ? data["isbn"] : ""]
  logger.addNewLog("main", [process, method, ...logInfo])

  try {
    switch (process) {
      case 'app':
        await appProcess({ event, method, data })
        break

      case 'adoption':
        await adoptionProcess({ event, method, data })
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

      case 'order':
        await orderProcess({ event, method, data })
        break

      case 'report':
        await reportProcess({ event, method, data })
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

    case 'dump-files':
      try {
        const filesBlob = await createZipBlob()
        await downloadFiles(event, 'Dump', [{ data: Buffer.from(await filesBlob.arrayBuffer()), extension: 'zip' }])
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
          const prevCourseAdoptions = await bSQLDB.adoptions.getPrevAdoptionsByCourse(year, data["course"]) as PrevAdoption[]

          childData = { prevAdoptions: formatPrevAdoptions(prevCourseAdoptions) }
        } catch (error) {
          throw error
        }
        break

      case 'course':
        try {
          childName = "course-data"
          childLocation = "bottom"
          const { booksResult } = await bSQLDB.books.getBooksByCourse(data["course"])

          childData = { books: booksResult, course: data["course"] }
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
  }
})
