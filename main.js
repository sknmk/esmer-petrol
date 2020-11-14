const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 650,
    height: 330,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    },
    icon: path.join(__dirname, './public/static/img/logo.png'),
    show: false
  })
  win.loadFile('./public/static/template/index.html').then()
  win.once('ready-to-show', () => {
    win.show()
  })
}

app.allowRendererProcessReuse = true
app.whenReady().then(createWindow)

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

// ipcRenderer - ipcMain Process
require(path.join(__dirname, './lib/dist/controller/Authentication'))
require(path.join(__dirname, './lib/dist/controller/Customer'))
require(path.join(__dirname, './lib/dist/controller/CustomerPlate'))
require(path.join(__dirname, './lib/dist/controller/CustomerDriver'))
require(path.join(__dirname, './lib/dist/controller/OnCredit'))
require(path.join(__dirname, './lib/dist/controller/Salesofficer'))
require(path.join(__dirname, './lib/dist/controller/Product'))
