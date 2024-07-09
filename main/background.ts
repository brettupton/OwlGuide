import path from 'path'
import fs from 'fs'
import { app, ipcMain, dialog, BrowserWindow, Menu, shell, MenuItem, Tray, nativeImage } from 'electron'
import serve from 'electron-serve'
import { v4 as uuidv4 } from 'uuid'
import { createWindow, updateSidebarPosition, updateBottomBarPosition, menuTemplate } from './helpers'
import { DevService, SalesService, DecisionService, AdoptionService, EnrollmentService } from './services'
import { TemplateAdoption } from '../types/TemplateAdoption'
import { XLSXCourse } from '../types/Enrollment'

const isProd = process.env.NODE_ENV === 'production'
const storesPath = path.join(__dirname, '..', 'resources', 'stores')
const iconPath = path.join(__dirname, '..', 'renderer', 'public', 'images', 'owl.ico')
const appHomeURL = isProd ? 'app://./home' : `http://localhost:${process.argv[2]}/home`
const childWindowURL = isProd ? 'app://./child' : `http://localhost:${process.argv[2]}/child`

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

let mainWindow: BrowserWindow | undefined
let salesWindow: BrowserWindow | undefined
let adoptionWindow: BrowserWindow | undefined
let contextMenu: Menu
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

    // Application Menu
    const menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)

    // Tray
    const icon = nativeImage.createFromPath(iconPath)
    tray = new Tray(icon)
    tray.setToolTip('OwlGuide')

    await mainWindow.loadURL(appHomeURL)

    if (!isProd) {
      // Load React DevTools only if in development
      const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer')
      installExtension(REACT_DEVELOPER_TOOLS)
        .then((name: string) => console.log(`Added Extension:  ${name}`))
        .catch((err: Error) => console.log('An error occurred: ', err))
    }
  })()

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('close-bars', () => {
  if (salesWindow) {
    salesWindow.close()
  }
  if (adoptionWindow) {
    adoptionWindow.close()
  }
})

ipcMain.on('minimize-app', (event) => {
  const window = BrowserWindow.getFocusedWindow()
  if (window) window.minimize()
})

ipcMain.on('close-app', (event) => {
  const window = BrowserWindow.getFocusedWindow()
  if (window) window.close()
})

// Right Mouse Click Menu
ipcMain.on('context-menu', (event, { x, y, query }: { x: number, y: number, query: string }) => {
  contextMenu = Menu.buildFromTemplate([
    {
      label: 'Cut',
      role: 'cut'
    },
    {
      label: 'Copy',
      role: 'copy'
    },
  ])
  const inspect = new MenuItem({
    label: 'Inspect Element',
    click: () => {
      mainWindow.webContents.inspectElement(x, y)
    }
  })
  const searchGoogle = new MenuItem({
    label: 'Search Google',
    click: () => {
      shell.openExternal(`https://www.google.com/search?q=${encodeURIComponent(query)}`)
    }
  })
  contextMenu.append(inspect)
  if (query) {
    contextMenu.append(searchGoogle)
  }
  contextMenu.popup({ window: mainWindow })
})

ipcMain.on('store-change', async (event, data) => {
  const store: number = data.store
  global.store = store
})

// On app initialization, check for mode and store
ipcMain.on('init-check', async (event) => {
  event.reply('init-reply', { isDev: !isProd, store: global.store | 0 })
})

// ** BUYING DECISION **
ipcMain.on('decision-upload', async (event, data) => {
  const filePath: string = data.filePath
  const buyingService = new DecisionService(filePath)
  let salesService: SalesService
  let BDTerm: string
  let isbn: string

  try {
    const { newBD, term } = await buyingService.getNewBD()
    salesService = new SalesService(term)
    BDTerm = term
    isbn = newBD[0].ISBN

    salesWindow = new BrowserWindow({
      width: mainWindow.getBounds().width / 2,
      height: mainWindow.getContentBounds().height,
      frame: false,
      parent: mainWindow,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })

    await salesWindow.loadURL(path.join(childWindowURL, 'decision-sales'))

    // Move sidebar to position on first load
    updateSidebarPosition(mainWindow, salesWindow)

    // Update sidebar location on move or resize of main window
    mainWindow.on('move', () => {
      if (salesWindow) {
        updateSidebarPosition(mainWindow, salesWindow)
      }
    })

    mainWindow.on('resize', () => {
      if (salesWindow) {
        updateSidebarPosition(mainWindow, salesWindow)
      }
    })

    // Clean up sidebar event listeners when closed
    salesWindow.on('closed', () => {
      salesWindow = null
      mainWindow.removeListener('move', () => {
        if (salesWindow) {
          updateSidebarPosition(mainWindow, salesWindow)
        }
      })
      mainWindow.removeListener('resize', () => {
        if (salesWindow) {
          updateSidebarPosition(mainWindow, salesWindow)
        }
      })
    })
    event.reply('new-decision', { newBD: newBD, term: term })
  } catch (err) {
    console.error(err)
    dialog.showErrorBox("Decision", "Something went wrong creating new buying decision.\n\nTry again later.")
  }

  try {
    const book = await salesService.searchISBN(isbn)
    salesWindow.webContents.send('isbn-data', { isbn, BDTerm, book })
  } catch (err) {
    console.error(err)
  }

})

ipcMain.on('isbn-lookup', async (event, { isbn, term }) => {
  const BDTerm = term
  const salesService = new SalesService(term)
  const book = await salesService.searchISBN(isbn)

  salesWindow.webContents.send('isbn-data', { isbn, BDTerm, book })
})

// ** ADOPTIONS **
ipcMain.on('adoption-upload', async (event, filePath: string) => {
  const adoptionService = new AdoptionService(filePath)
  try {
    const term = await adoptionService.getTerm()
    const campus = await adoptionService.getCampus()
    const allCourses = await adoptionService.getCourses()

    event.reply('adoption-data', { allCourses, term, campus })

  } catch (err) {
    console.error(err)
    dialog.showErrorBox("Adoption Error", "There was an error parsing adoption data.\n\n Please try again.")
  }
})

ipcMain.on('create-template-window', async (event) => {
  if (adoptionWindow) {
    adoptionWindow.close()
  }

  try {
    adoptionWindow = new BrowserWindow({
      width: mainWindow.getContentBounds().width - 9,
      height: mainWindow.getContentBounds().height * (1 / 3),
      frame: false,
      movable: false,
      resizable: false,
      parent: mainWindow,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })

    const port = process.argv[2]
    await adoptionWindow.loadURL(`http://localhost:${port}/adoption/new-template`)

    // Move sidebar to position on first load
    updateBottomBarPosition(mainWindow, adoptionWindow)

    // Update sidebar location on move or resize of main window
    mainWindow.on('move', () => {
      if (adoptionWindow) {
        updateBottomBarPosition(mainWindow, adoptionWindow)
      }
    })

    mainWindow.on('resize', () => {
      if (adoptionWindow) {
        updateBottomBarPosition(mainWindow, adoptionWindow)
      }
    })

    // Clean up sidebar event listeners when closed
    adoptionWindow.on('closed', () => {
      adoptionWindow = null
      mainWindow.removeListener('move', () => {
        if (adoptionWindow) {
          updateBottomBarPosition(mainWindow, adoptionWindow)
        }
      })
      mainWindow.removeListener('resize', () => {
        if (adoptionWindow) {
          updateBottomBarPosition(mainWindow, adoptionWindow)
        }
      })
    })
  } catch (err) {
    console.error('Error opening sidebar: ', err)
  }
})

ipcMain.on('new-template-course', (event, { Course, Title, term, campus }: { Course: string, Title: string, term: string, campus: string }) => {
  adoptionWindow.webContents.send('new-course', { Course, Title, term, campus })
})

ipcMain.on('template-submit', (event, { templateCourses, term, campus }: { templateCourses: TemplateAdoption[], term: string, campus: string }) => {
  // Get current date and unique ID for filename
  const formattedDate = new Date().toJSON().slice(0, 10).split("-").join("")
  const uniqueId = uuidv4().split('-')[0]

  const adoptionService = new AdoptionService()
  try {
    const csv = adoptionService.downloadCSV(templateCourses, term, campus)
    dialog.showSaveDialog({
      defaultPath: path.join(app.getPath('downloads'), `AIP_${term[0] + term.slice(-2)}_${formattedDate}_${uniqueId}`),
      filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    })
      .then(result => {
        if (!result.canceled && result.filePath) {
          fs.writeFile(result.filePath, csv, 'utf8', (err) => {
            if (err) {
              throw new Error()
            }
            mainWindow.webContents.send('download-success')
          })
        }
      })
    // TODO: Move unsubmitted courses to submitted and resend data
    // For now, refresh the page on client
  } catch (err) {
    dialog.showErrorBox("Error", "Error downloading template.\n\nPlease try again.")
  }
})

// ** ENROLLMENT **
ipcMain.on('enrollment-file-loaded', async (event, filePath: string) => {
  const enrollmentService = new EnrollmentService(filePath)
  try {
    const { prevCourses, fileName } = await enrollmentService.getPrevEnrollment()
    event.reply('enrollment-file-found', fileName)
  } catch (err) {
    dialog.showMessageBox(mainWindow, {
      type: "warning",
      title: "Enrollment",
      message: "No previous enrollment file found.\n\nTry again or continue without one."
    })
    event.reply('enrollment-file-found', "")
  }
})

ipcMain.on('enrollment-upload', async (event, { filePath, prevFilePath }: { filePath: string, prevFilePath: string }) => {
  const enrollmentService = new EnrollmentService(filePath)
  try {
    if (prevFilePath !== "") {
      await enrollmentService.createPrevEnrollment(prevFilePath)
    }
    const { courses, noMatch } = await enrollmentService.matchPrevOfferings()
    event.reply('need-offering', noMatch)
  } catch (err) {
    console.error(err)
  }
})

ipcMain.on('offerings-submit', async (event, { filePath, needOfferings }: { filePath: string, needOfferings: XLSXCourse[] }) => {
  const enrollmentService = new EnrollmentService(filePath)
  try {
    const { csv, json } = await enrollmentService.createCourseCSV(needOfferings)
    dialog.showSaveDialog({
      defaultPath: path.join(app.getPath('downloads'), `${enrollmentService.fileName}_Formatted`),
      filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    })
      .then(result => {
        if (!result.canceled && result.filePath) {
          // Create directory, if doesn't exist, and write new CSV file to JSON for next enrollment
          if (fs.existsSync(enrollmentService.enrollPath)) {
            fs.readdir(enrollmentService.enrollPath, (err, files) => {
              fs.unlink(path.join(enrollmentService.enrollPath, files[0]), (err) => {
                if (err) {
                  throw new Error("Something went wrong deleting old JSON file.")
                }
                fs.writeFile(path.join(enrollmentService.enrollPath, `${enrollmentService.fileName}.json`), JSON.stringify(json, null, 4), 'utf8', (err) => {
                  if (err) {
                    throw new Error("Something went wrong creating new JSON file.")
                  }
                })
              })

            })
          } else {
            fs.mkdir(enrollmentService.enrollPath, { recursive: true }, (err) => {
              if (err) {
                throw new Error("Something went wrong creating the CSV directory.")
              }
              fs.writeFile(path.join(enrollmentService.enrollPath, `${enrollmentService.fileName}.json`), JSON.stringify(json, null, 4), 'utf8', (err) => {
                if (err) {
                  throw new Error("Something went wrong with creating the JSON file after creating the directory.")
                }
              })
            })
          }
          // Write csv file to user selected filepath
          fs.writeFile(result.filePath, csv, 'utf8', (err) => {
            if (err) {
              throw new Error()
            }
            mainWindow.webContents.send('download-success')
          })
        }
      })
  } catch (err) {
    console.error(err)
    dialog.showErrorBox("Error", "Something went wrong with creating the new CSV.\n\nTry again later.")
  }
})

// ** DEV ** 
ipcMain.on('new-sales', async (event, data) => {
  const store: number = data.store
  const term: string = data.term
  const filePath: string = data.filePath

  const storePath = path.join(storesPath, `${store}`)
  const termPath = path.join(storePath, 'sales', `${term}.json`)

  if (!fs.existsSync(storePath)) {
    fs.mkdir(path.join(storePath, 'sales'), { recursive: true }, (err) => {
      if (err) {
        console.error(err)
        return
      }
    })
  }

  const devService = new DevService(filePath)

  try {
    const newSales = await devService.addNewSales(devService.fileData, devService.headerIndices, event)
    fs.writeFile(termPath, JSON.stringify(newSales, null, 4), 'utf8', () => {
      dialog.showMessageBox(mainWindow,
        {
          type: "info",
          title: "OwlGuide",
          message: `Success\n Store: ${data.store}\n Term: ${data.term}\n Total Titles: ${Object.keys(newSales).length}`
        })
    })
  } catch (err) {
    console.error(err)
  }
})
