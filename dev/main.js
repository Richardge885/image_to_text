const { app, BrowserWindow, ipcMain, webContents } = require('electron');
const path = require('path');
const url = require('url');
const Tesseract = require('tesseract.js');

let mainWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 800,
        resizable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true,
        },
    });
    mainWindow.loadFile('./dev/public/index.html');
}

app.on('ready', () => {
    createMainWindow();
    mainWindow.on('ready', () => {
        mainWindow = null;
    });
});

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    } else {
        mainWindow = null;
    }
});

ipcMain.on('extract-text', (event, data) => {
    let language;
    if (!data.imagePath) {
        event.reply('text-extraction-failed', 'No image uploaded');
        return;
    }
    if (data.language == 'chinese') {
        language = 'chi_sim';
    } else if (data.language == 'traditional-chinese') {
        language = 'chi_tra';
    } else {
        language = 'eng';
    }
    Tesseract.recognize(data.imagePath, language, {
        logger: (info) => {
            mainWindow.webContents.send('update progress', info.progress);
        },
    })
        .then(({ data: { text } }) => {
            // Send the extracted text back to the renderer process
            event.reply('text-extracted', text);
        })
        .catch((error) => {
            console.error('Error:', error);
            event.reply('text-extraction-failed', 'Text extraction failed');
        });
});
