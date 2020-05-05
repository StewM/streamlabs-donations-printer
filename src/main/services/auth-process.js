import { BrowserWindow } from 'electron'
import authService from './auth-service'
import createAppWindow from './app-process'

let win = null

function createAuthWindow() {
    destroyAuthWin()

    // Create the browser window.
    win = new BrowserWindow({
        width: 1000,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
        }
    })

    if(process.env.NODE_ENV !== 'development'){
        win.removeMenu()
    }

    win.loadURL(authService.getAuthenticationURL())

    const {
        session: { webRequest }
    } = win.webContents

    const filter = {
        urls: ['file:///callback*']
    }

    webRequest.onBeforeRequest(filter, async ({ url }) => {
        await authService.loadTokens(url)
        createAppWindow()
        return destroyAuthWin()
    })

    win.on('authenticated', () => {
        destroyAuthWin()
    })

    win.on('closed', () => {
        win = null
    })
}

function destroyAuthWin() {
    if (!win) return
    win.close()
    win = null
}

export default createAuthWindow