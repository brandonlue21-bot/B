const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('gradebookAPI', {
  loadData: () => ipcRenderer.invoke('gradebook:load-data'),
  saveData: (data) => ipcRenderer.invoke('gradebook:save-data', data),
  getDataPath: () => ipcRenderer.invoke('gradebook:get-data-path'),
});
