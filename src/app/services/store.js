import electron from "electron"
import {fromJS, Map} from "immutable"
import {createStore, applyMiddleware, compose} from "redux"
import thunk from "redux-thunk"
import createLogger from "redux-logger"
import isEmpty from "lodash/isEmpty"
import fs from "fs"

export default (rootReducer, dataStore, actualizeState) => {

    const dataPath = electron.remote.app.getPath('userData')
    const filePath = dataPath + '/state.json'

    function writeState(state) {
        fs.writeFileSync(filePath, JSON.stringify(state, null, 4), 'utf-8')
    }

    let state = Map()

    if (fs.existsSync(filePath)) {
        let storedState = fs.readFileSync(filePath, 'utf-8')

        if (!isEmpty(storedState)) {
            storedState = JSON.parse(storedState)
        }

        if (storedState) {
            state = fromJS(storedState)
        }
    }


    const initialState = actualizeState(state)

    if (initialState !== state) {
        writeState(initialState)
    }

    const logger = createLogger()

    const createStoreWithMiddleware = applyMiddleware(thunk, logger)(createStore)

    const store = createStoreWithMiddleware(rootReducer, initialState, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({
            actionCreators: dataStore.getFlatActionCreators()
        }))

    store.subscribe(() => {
        const state = store.getState().toJSON()
        writeState(state)
    })

    return store
}