import electron from "electron"
const {Menu} = electron.remote
import get from "lodash/get"

export default (store) => {

    return (delegate) => {

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
                        electron.remote.app.quit()
                    }
                }]
            }, {
                label: 'File',
                submenu: [{
                    label: 'New Tab',
                    accelerator: 'Command+T',
                    click: get(delegate, 'file.newTab.click')
                }, {
                    label: 'Close Tab',
                    accelerator: 'Command+W',
                    click: get(delegate, 'file.closeTab.click')
                }, {
                    type: 'separator'
                }, {
                    label: get(delegate, 'file.clearHistoryQueries.description'),
                    click: get(delegate, 'file.clearHistoryQueries.click')
                }, {
                    label: get(delegate, 'file.clearCollectionQueries.description'),
                    click: get(delegate, 'file.clearCollectionQueries.click')
                }]
            }, {
                label: 'Edit',
                submenu: [{
                    label: get(delegate, 'edit.prettifyQuery.description'),
                    accelerator: 'Command+O',
                    click: get(delegate, 'edit.prettifyQuery.click')
                }, {
                    label: get(delegate, 'edit.executeQuery.description'),
                    accelerator: 'Command+E',
                    click: get(delegate, 'edit.executeQuery.click')
                }, {
                    label: get(delegate, 'edit.saveQuery.description'),
                    accelerator: 'Command+S',
                    click: get(delegate, 'edit.saveQuery.click')
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
                    label: 'Panels',
                    sublabel: 'test',
                    submenu: [{
                        type: 'checkbox',
                        label: 'Collection',
                        accelerator: 'Command+1',
                        checked: get(delegate, 'view.panels.collection.checked'),
                        click: get(delegate, 'view.panels.collection.click')
                    }, {
                        type: 'checkbox',
                        label: 'History',
                        accelerator: 'Command+2',
                        checked: get(delegate, 'view.panels.history.checked'),
                        click: get(delegate, 'view.panels.history.click')
                    }, {
                        type: 'checkbox',
                        label: 'Project',
                        accelerator: 'Command+3',
                        checked: get(delegate, 'view.panels.project.checked'),
                        click: get(delegate, 'view.panels.project.click')
                    }, {
                        type: 'checkbox',
                        label: 'Environment',
                        accelerator: 'Command+4',
                        checked: get(delegate, 'view.panels.environment.checked'),
                        click: get(delegate, 'view.panels.environment.click')
                    }, {
                        type: 'checkbox',
                        label: 'Query',
                        accelerator: 'Command+5',
                        checked: get(delegate, 'view.panels.query.checked'),
                        click: get(delegate, 'view.panels.query.click')
                    }, {
                        type: 'checkbox',
                        label: 'Documentation',
                        accelerator: 'Command+6',
                        checked: get(delegate, 'view.panels.documentation.checked'),
                        click: get(delegate, 'view.panels.documentation.click')
                    }, {
                        type: 'checkbox',
                        label: 'Query variables',
                        accelerator: 'Command+7',
                        checked: get(delegate, 'view.panels.queryVariables.checked'),
                        click: get(delegate, 'view.panels.queryVariables.click')
                    }]
                }, {
                    type: 'separator'
                }, {
                    label: 'Reload',
                    accelerator: 'Command+R',
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