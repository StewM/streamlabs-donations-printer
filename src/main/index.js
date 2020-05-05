require('dotenv').config()
import { app, ipcMain } from 'electron'
import createAuthWindow from './services/auth-process'
import createAppWindow from './services/app-process'
import authService from './services/auth-service'
import printService from './services/print-service'
import store from '../renderer/store'
const fs = require('fs')
const path = require('path')
const printerService = require('printer')


/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

// create pdf folder if it doesn't exist
if (!fs.existsSync('./pdfs')) {
  fs.mkdirSync('./pdfs');
}

// clear out any old pdfs
fs.readdir('pdfs', (err, files) => {
  if (err) throw err

  for (const file of files) {
    fs.unlink(path.join('pdfs', file), err => {
      if (err) throw err
    })
  }
})

store.dispatch('stop_running')

let socket

// get printer names and put in the store
let printers = printerService.getPrinters()
let printerNames = []
printers.forEach(printer => {
  printerNames.push(printer.name)
});

store.dispatch('set_printers', printerNames)

let mainWindow

async function createWindow() {
  try {
    await authService.refreshTokens()
    mainWindow = createAppWindow()
  } catch (err) {
    createAuthWindow()
  }
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('update-config', (event, args) => {
  store.dispatch('set_selected_printer', args.selectedPrinter)
  store.dispatch('set_min_donation', args.minDonation)
})

ipcMain.on('start-printer', (event, arg) => {
  store.dispatch('start_running')
  let options = {
    printer: store.state.Main.selectedPrinter,
    minDonation: store.state.Main.minimumDonation,
    socketToken: authService.getSocketToken()
  }
  socket = printService.startListening(options)
})

ipcMain.on('stop-printer', (event, arg) => {
  socket.close()
  socket = null
  store.dispatch('stop_running')

  // clear out any old pdfs
  fs.readdir('pdfs', (err, files) => {
    if (err) throw err

    for (const file of files) {
      fs.unlink(path.join('pdfs', file), err => {
        if (err) throw err
      })
    }
  })
})

ipcMain.on('logout', (event, arg) => {
  authService.logout()
  app.quit()
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
