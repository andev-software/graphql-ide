import React from "react"
import ReactDOM from "react-dom"

export default (RootView) => {

    function renderApplicationRoot() {
        return new Promise((resolve) => {
            ReactDOM.render(<RootView />, document.getElementById('root'), resolve)
        })
    }

    function removeApplicationLoader() {
        document.getElementById('app-loader').remove()
    }

    function run() {
        renderApplicationRoot()
            .then(() => removeApplicationLoader())
    }

    return {
        run
    }
}