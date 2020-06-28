import { app, ipcMain } from 'electron'
import createAppWindow from './services/app-process'
import printService from './services/print-service'
import store from '../renderer/store'
const fs = require('fs')
const path = require('path')


/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

store.dispatch('set_version', app.getVersion())

// create pdf folder if it doesn't exist
if (!fs.existsSync('./pdfs')) {
  fs.mkdirSync('./pdfs');
}

if (!fs.existsSync('./images')) {
  fs.mkdirSync('./images');
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

// clear out any old images
fs.readdir('images', (err, files) => {
  if (err) throw err

  for (const file of files) {
    fs.unlink(path.join('images', file), err => {
      if (err) throw err
    })
  }
})

// ensure that the current state of the store isn't running
store.dispatch('stop_running')

let socket

// get printers
printService.getPrinters().then(printers => {
  store.dispatch('set_printers', printers)
})

let mainWindow

async function createWindow() {
  mainWindow = createAppWindow()
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
  store.dispatch('set_min_color', args.minColor)
  store.dispatch('set_print_color', args.printColor)
  store.dispatch('set_api_token', args.apiToken)
})

ipcMain.on('start-printer', (event, arg) => {
  store.dispatch('start_running')
  let options = {
    printer: store.state.Main.selectedPrinter,
    minDonation: store.state.Main.minimumDonation,
    minColor: store.state.Main.minColor,
    printColor: store.state.Main.printColor,
    socketToken: store.state.Main.apiToken
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

  // clear out any old images
  fs.readdir('images', (err, files) => {
    if (err) throw err

    for (const file of files) {
      fs.unlink(path.join('images', file), err => {
        if (err) throw err
      })
    }
  })
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
