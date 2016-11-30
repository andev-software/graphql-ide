import React from "react"
import ReactDOM from "react-dom"

export default (RootView, server, setupMenu) => {

    function renderApplicationRoot() {
        return new Promise((resolve) => {
            ReactDOM.render(<RootView />, document.getElementById('root'), resolve)
        })
    }

    function removeApplicationLoader() {
        document.getElementById('app-loader').remove()
    }

    function startServer() {

        server.listen('9090', '0.0.0.0', () => {
            console.log(`Server has been started at http://0.0.0.0:9090`)
        })

    }

    function run() {
        startServer()
        setupMenu()
        renderApplicationRoot()
            .then(() => removeApplicationLoader())
    }

    return {
        run
    }
}