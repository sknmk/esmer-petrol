const { app, BrowserWindow } = require("electron")
const path = require("path")

function createWindow () {
  const win = new BrowserWindow({
    width: 650,
    height: 330,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    },
    icon: path.join(__dirname, "./public/static/img/logo.png")
  })
  win.loadFile("./public/static/template/index.html")
  // win.webContents.openDevTools()
}
app.allowRendererProcessReuse = true;
app.whenReady().then(createWindow)

app.on('ready', () => {
  if (process.env.NODE_ENV !== 'production') {
    require('vue-devtools').install()
  }
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// ipcRenderer - ipcMain Process
require("./lib/dist/controller/Authentication")
