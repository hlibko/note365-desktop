const { app, BrowserWindow } = require('electron');
const { is, setContentSecurityPolicy } = require('electron-util');
const config = require('./config');

// Чтобы не собирать мусор, объявляем window в виде переменной
let window;
// Указываем детали окна браузера
function createWindow() {
  window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false
    }
  });

  // load the URL
  if (is.development) {
    window.loadURL(config.LOCAL_WEB_URL);
  } else {
    window.loadURL(config.PRODUCTION_WEB_URL);
  }

  // Если приложение в режиме разработки, открываем браузерные инструменты
  // разработчика
  if (is.development) {
    window.webContents.openDevTools();
  }

  // Устанавливаем CSP в производственном режиме
  if (!is.development) {
    setContentSecurityPolicy(`
      default-src 'none';
      script-src 'self';
      img-src 'self' https://www.gravatar.com;
      style-src 'self' 'unsafe-inline';
      font-src 'self';
      connect-src 'self' ${config.PRODUCTION_API_URL};
      base-uri 'none';
      form-action 'none';
      frame-ancestors 'none';
    `);
  }

  // При закрытии окна сбрасываем объект
  window.on('closed', () => {
    window = null;
  });
}
// Когда electron готов, создаем окно приложения
app.on('ready', createWindow);

// Выходим при закрытии всех окон
app.on('window-all-closed', () => {
  // В macOS выходим, только если пользователь явно закрывает приложение
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // В macOS повторно создаем окно при нажатии иконки в панели dock
  if (window === null) {
    createWindow();
  }
});
