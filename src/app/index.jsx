import React from "react"
import ReactDOM from "react-dom"

export default (RootView, setupMenu) => {

    function renderApplicationRoot() {
        return new Promise((resolve) => {
            ReactDOM.render(<RootView />, document.getElementById('root'), resolve)
        })
    }

    function removeApplicationLoader() {
        document.getElementById('app-loader').remove()
    }

    function run() {
        setupMenu()
        renderApplicationRoot()
            .then(() => removeApplicationLoader())
    }

    return {
        run
    }
}