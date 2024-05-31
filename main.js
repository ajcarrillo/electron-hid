// main.js

import { app, BrowserWindow, ipcMain } from 'electron'
import HID from 'node-hid'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let device

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      enableRemoteModule: true,
      nodeIntegration: true
    }
  })

  mainWindow.loadURL('http://localhost:3000')
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.handle('connect-device', async () => {
  try {
    device = await HID.HIDAsync.open(13932, 2)

    device.on('data', (data) => {
      console.log(data)
      const dataArray = data.toJSON().data
      console.log('Device data:', dataArray)
      const mainWindow = BrowserWindow.getAllWindows()[0]
      mainWindow.webContents.send('device-data', dataArray)
    })

    device.on('error', (err) => {
      console.error('Device error:', err)
    })

    return { status: 'connected' }
  } catch (error) {
    console.error('Failed to connect to device:', error)
    return { status: 'error', message: error.message }
  }
})

ipcMain.handle('open-device', async () => {
  if (device) {
    try {
      await device.write([255, 2, 1])
      await device.write([255, 2, 2])
      return { status: 'opened' }
    } catch (error) {
      console.error('Failed to open device:', error)
      return { status: 'error', message: error.message }
    }
  } else {
    return { status: 'error', message: 'Device not connected' }
  }
})
