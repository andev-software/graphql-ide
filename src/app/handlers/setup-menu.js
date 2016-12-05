import electron from "electron"
const {Menu} = electron.remote

export default (store) => {

    return () => {

        const currentWindow = electron.remote.getCurrentWindow()

        let template = []

        if (process.platform === 'darwin') {
            template = [{
                label: 'GraphiQL',
                submenu: [{
                    label: 'About GraphiQL',
                    selector: 'orderFrontStandardAboutPanel:'
                }, {
                    type: 'separator'
                }, {
                    label: 'Services',
                    submenu: []
                }, {
                    type: 'separator'
                }, {
                    label: 'Hide GraphiQL',
                    accelerator: 'Command+H',
                    selector: 'hide:'
                }, {
                    label: 'Hide Others',
                    accelerator: 'Command+Shift+H',
                    selector: 'hideOtherApplications:'
                }, {
                    label: 'Show All',
                    selector: 'unhideAllApplications:'
                }, {
                    type: 'separator'
                }, {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: function () {
                        app.quit()
                    }
                }]
            }, {
                label: 'File',
                submenu: [{
                    label: 'New Tab',
                    accelerator: 'Command+T',
                    click: () => {
                        console.log('new tab')
                        store.dispatch({
                            type: 'BUMP_VERSION'
                        })
                    }
                }, {
                    type: 'separator'
                }, {
                    label: 'Close Tab',
                    accelerator: 'Command+W',
                    click: () => {
                        console.log('close tab')
                    }
                }]
            }, {
                label: 'Edit',
                submenu: [{
                    label: 'Prettify query',
                    accelerator: 'Command+P',
                    click: () => {
                        console.log('prettify query')
                    }
                }, {
                    type: 'separator'
                }, {
                    label: 'Cut',
                    accelerator: 'Command+X',
                    selector: 'cut:'
                }, {
                    label: 'Copy',
                    accelerator: 'Command+C',
                    selector: 'copy:'
                }, {
                    label: 'Paste',
                    accelerator: 'Command+V',
                    selector: 'paste:'
                }, {
                    label: 'Select All',
                    accelerator: 'Command+A',
                    selector: 'selectAll:'
                }]
            }, {
                label: 'View',
                submenu: [{
                    label: 'Panes',
                    sublabel: 'test',
                    submenu: [{
                        type: 'checkbox',
                        label: 'Collection',
                        accelerator: 'Command+1',
                        click: () => {
                            console.log('test123')
                        }
                    }, {
                        type: 'checkbox',
                        label: 'History',
                        accelerator: 'Command+2',
                        click: () => {
                            console.log('test123')
                        }
                    }, {
                        type: 'checkbox',
                        label: 'Documentation',
                        accelerator: 'Command+3',
                        click: () => {
                            console.log('test123')
                        }
                    }, {
                        type: 'checkbox',
                        label: 'Query variables',
                        accelerator: 'Command+4',
                        click: () => {
                            console.log('test123')
                        }
                    }, {
                        type: 'checkbox',
                        label: 'Variables',
                        accelerator: 'Command+5',
                        click: () => {
                            console.log('test123')
                        }
                    }, {
                        type: 'checkbox',
                        label: 'Headers',
                        accelerator: 'Command+6',
                        click: () => {
                            console.log('test123')
                        }
                    }]
                }, {
                    type: 'separator'
                }, {
                    label: 'Reload',
                    accelerator: 'Command+Shift+R',
                    click: function () {
                        currentWindow.reload()
                    }
                }, {
                    label: 'Toggle Full Screen',
                    accelerator: 'Ctrl+Command+F',
                    click: function () {
                        currentWindow.setFullScreen(!currentWindow.isFullScreen())
                    }
                }, {
                    role: 'resetzoom'
                }, {
                    role: 'zoomin'
                }, {
                    role: 'zoomout'
                }, {
                    type: 'separator'
                }, {
                    label: 'Developer',
                    submenu: [{
                        label: 'Developer Tools',
                        accelerator: 'Alt+Command+I',
                        click: function () {
                            currentWindow.toggleDevTools()
                        }
                    }]
                }]
            }, {
                label: 'Window',
                submenu: [{
                    label: 'Minimize',
                    accelerator: 'Command+M',
                    selector: 'performMiniaturize:'
                }, {
                    type: 'separator'
                }, {
                    label: 'Bring All to Front',
                    selector: 'arrangeInFront:'
                }]
            }]
        } else {
            template = [{
                label: '&View',
                submenu: [{
                    label: '&Reload',
                    accelerator: 'Ctrl+R',
                    click: function () {
                        currentWindow.restart()
                    }
                }, {
                    label: 'Toggle &Full Screen',
                    accelerator: 'F11',
                    click: function () {
                        currentWindow.setFullScreen(!currentWindow.isFullScreen())
                    }
                }, {
                    label: 'Toggle &Developer Tools',
                    accelerator: 'Alt+Ctrl+I',
                    click: function () {
                        currentWindow.toggleDevTools()
                    }
                }]
            }]
        }

        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
        // electron.remote.getCurrentWindow().setMenu(menu)
    }
}