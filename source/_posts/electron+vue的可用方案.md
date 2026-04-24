---
title: vue结合electron开发桌面应用的可行方案
date: 2026-02-14
categories:
  - 技术分享
tags:
  - 桌面开发
  - vue
  - electron
excerpt: 本文主要在于介绍electron结合vue开发桌面应用的一个可行方案，适合初学者入门，详细文章请移步：https://blog.csdn.net/foeria/article/details/151795654?spm=1001.2014.3001.5501
---
最近需要用vue结合electron开发桌面应用，在网上搜索了许多教程，内容都比较过时，容易让很多萌新走弯路，这里提供一个可行的模块化方案。

1.首先，创建一个vue3项目

```bash
npm create vue@latest
 
```

![]()

![](https://i-blog.csdnimg.cn/direct/5f7d0a9cb23245dc9d5bc6940c4e62c2.png)![]()**编辑**

![](https://i-blog.csdnimg.cn/direct/7a88bd6affd845b4a69f47a141b05b4f.png)![]()**编辑**

创建好一个vue3项目，填入项目名称等信息后，用vscode打开，跑通项目。

2.在主文件目录下创建electron文件夹，并在文件夹中创建main.js和preload.mjs文件。注意，这里的preload的后缀一定是.mjs，因为我们要使用module的方式导入依赖。

![](https://i-blog.csdnimg.cn/direct/29cb607a46424bf497402b557f6a4a15.png)![]()**编辑**

3.填上main.js这个文件的基本配置，可以[参考官网](https://www.electronjs.org/zh/docs/latest/tutorial/tutorial-first-app "参考官网")

![](https://i-blog.csdnimg.cn/direct/3c207fc34e2e4033a464eb048ce8bb26.png)![]()**编辑**

注意，其中win.loadURL("http://localhost:5173/")的url要与你vue项目的启动时的地址一致，以下时我文件中的配置。

```javascript
import { app, BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.mjs'),
      webSecurity: true,
    },
    autoHideMenuBar: false,
  })
  win.webContents.openDevTools()
  win.loadURL('http://localhost:5173/')
}

app.whenReady().then(() => {
  createWindow() //创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

![]()

3.导入electron，等待其下载完毕，

```bash
npm install electron --save-dev
 
```

![]()

![](https://i-blog.csdnimg.cn/direct/7ac47023ad324026bb87356a2e80b0d9.png)![]()**编辑**

部分用户可能会遇到网络原因而导致下载不成功的情况，遇到这个情况可以在根目录添加.npmrc文件，并添加其镜像源。

```bash
registry=https://registry.npmmirror.com
electron_mirror=https://npmmirror.com/mirrors/electron/
```

![]()

4.修改package.json文件，添加主进程的配置项等信息，可参考官网的配置代码，配置绑定vite启动命令，

```bash
//以下官网的配置项
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "description": "Hello World!",
  "main": "main.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Jane Doe",
  "license": "MIT",
  "devDependencies": {
    "electron": "23.1.3"
  }
}
```

![]()

根据官网的配置，添加main，author，license，version等信息，尤其是其中的main，按照以上的配置，需在这里填写"./electron/main.js"，可以先预填上，后期打包的时候再按需修改，以下是我项目中的配置，可以作参考。

![](https://i-blog.csdnimg.cn/direct/529dc1db8d7a4ad48200bcf70dda4a60.png)![]()**编辑**

5.接下来是下载vite-plugin-electron这个插件，这个插件可以实现让electron项目，通过vite启动，这一步很重要。

首先执行命令，等待依赖下载完成。

```bash
npm i vite-plugin-electron
```

![]()

然后我们来到vite.config.js文件，导入插件，并编辑electron的入口。

![](https://i-blog.csdnimg.cn/direct/da8887be79ea4b929aa2205ef248f30f.png)![]()**编辑**

完成到这一步，就能通过npm run dev启动项目了。

![](https://i-blog.csdnimg.cn/direct/c052cc8180ec44c6bcda2bc6bbc620a2.png)![]()**编辑**

当然，控制台有个小小的安全警告，网上有很多解决这个警告的教程，这里附上一种，在html文件中插入以下代码：

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline';">
```

![]()

![](https://i-blog.csdnimg.cn/direct/28c26d2422d24b999d1607d0b9e4031e.png)![]()**编辑**
