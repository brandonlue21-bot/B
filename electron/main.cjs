const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

const dataFilePath = path.join(app.getPath('userData'), 'gradebook-data.json');

async function loadData() {
  try {
    const raw = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function saveData(data) {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
}

ipcMain.handle('gradebook:load-data', () => loadData());
ipcMain.handle('gradebook:save-data', (_event, data) => saveData(data));
ipcMain.handle('gradebook:get-data-path', () => dataFilePath);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Show a native Save dialog for anything the page downloads (CSV/JSON exports),
  // since a plain <a download> click has nowhere useful to land in a desktop window.
  win.webContents.session.on('will-download', (_event, item) => {
    const savePath = dialog.showSaveDialogSync(win, {
      defaultPath: item.getFilename(),
    });
    if (!savePath) {
      item.cancel();
      return;
    }
    item.setSavePath(savePath);
  });

  const devServerUrl = process.env.GRADEBOOK_DEV_SERVER_URL;
  if (devServerUrl) {
    win.loadURL(devServerUrl);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  return win;
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
