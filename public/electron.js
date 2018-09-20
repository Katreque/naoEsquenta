// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
var path = require('path')
const url = require('url');
const {exec, spawn} = require('child_process');
const extract = require('extract-zip')
const fs = require('fs');

const execPath = process.env.ENV_DEV?"/..":"/../..";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 450, title: "Não Esquenta!"})

  // and load the index.html of the app.
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '/../build/index.html'),
    protocol: 'file:',
    slashes: true
  });

  mainWindow.loadURL(startUrl);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

ipcMain.on('executa-bat-referente', (event, arg) => {
    const rn = exec(path.join(__dirname, execPath + "/extraFiles/svn.bat"));

    rn.stdout.on('close', (code, signal) => {
      event.sender.send('executa-bat-referente-resposta');
    })

    rn.stderr.on('data', (data) => {
      event.sender.send('executa-bat-referente-resposta-error', data.toString());
    })
})

ipcMain.on('roda-npm-i', (event, arg) => {
  const rn = exec(path.join(__dirname, execPath + "/extraFiles/npmi.bat"));

  rn.stdout.on('close', (code, signal) => {
    event.sender.send('roda-npm-i-resposta');
  })

  /*rn.stderr.on('data', (data) => {
    event.sender.send('roda-npm-i-resposta-error', data.toString());
  })*/
})

ipcMain.on('build-extensao', (event, arg) => {
  const rn = exec(path.join(__dirname, execPath + "/extraFiles/gulp.bat"));

  rn.stdout.on('close', (code, signal) => {
    event.sender.send('build-extensao-resposta');
  })
})

ipcMain.on('extrai-extensao', (event, arg) => {
  extract("C:/erp4meExtensao/versoes_liberadas/extensaoPogChamp.zip", {dir: "C:/erp4meExtensao/versoes_liberadas"}, function (err) {
    if (!!err) {
      event.sender.send('extrai-extensao-resposta-error', err.toString());
    } else {
      event.sender.send('extrai-extensao-resposta');
    }
   })
})

ipcMain.on('ajusta-id-dll', (event, arg) => {
  fs.copyFile(path.join(__dirname, execPath + "/extraFiles/br.com.alterdata.koopon.json"), 'C:\\Program Files (x86)\\Alterdata\\Nimbus\\Koopon-e\\Host\\br.com.alterdata.koopon.json', (err) => {
    if (!!err) {
      event.sender.send('ajusta-id-dll-resposta-error', err.toString());
    } else {
      event.sender.send('ajusta-id-dll-resposta');
    }
  });
})

ipcMain.on('possui-node-instalado', (event, args) => {
  let rn = spawn("node", ["-v"]);

  rn.on('error', () => {
    return event.sender.send('possui-node-instalado-resposta-error');
  })

  rn.stdout.on('data', (data) => {
    let _data = data.toString();
    if (_data[0] === 'v') {
      return event.sender.send('possui-node-instalado-resposta');
    }
  })
})

ipcMain.on('instala-node', (event, args) => {
  const rn = exec(path.join(__dirname, execPath + "/extraFiles/node-v8.12.0-x64.msi"));

  rn.stderr.on('data', (data) => {
    return event.sender.send('instala-node-resposta-error');
  })

  rn.on('close', (code, signal) => {
    return event.sender.send('instala-node-resposta');
  })
})

ipcMain.on('possui-tortoise-instalado', (event, args) => {
  let rn = exec("svn --version --quiet");
  let sp = spawn("svn", ["--version"])

  sp.on('error', () => {
    return event.sender.send('possui-tortoise-instalado-resposta-error');
  })

  rn.stdout.on('data', (data) => {
    let _data = data.toString();
    if (_data[0] === '1') {
      return event.sender.send('possui-tortoise-instalado-resposta');
    }
  })
})

ipcMain.on('instala-tortoise', (event, args) => {
  const rn = exec(path.join(__dirname, execPath + "/extraFiles/tortoise-svn.msi"));

  rn.stderr.on('data', (data) => {
    return event.sender.send('instala-tortoise-resposta-error');
  })

  rn.on('close', (code, signal) => {
    return event.sender.send('instala-tortoise-resposta');
  })
})

ipcMain.on('encerrar', (event, arg) => {
  mainWindow.close();
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})