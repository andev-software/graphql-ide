import electron from "electron"
import {Map} from "immutable"
import {createStore, applyMiddleware, compose} from "redux"
import thunk from "redux-thunk"
import createLogger from "redux-logger"
import {persistStore, autoRehydrate} from 'redux-persist-immutable'
import {AsyncNodeStorage} from 'redux-persist-node-storage'

export default (rootReducer, dataStore) => {

    const dataPath = electron.remote.app.getPath('userData')

    const initialState = Map()

    const logger = createLogger()

    const createStoreWithMiddleware = applyMiddleware(thunk, logger)(createStore)

    const store = createStoreWithMiddleware(rootReducer, initialState, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({
            actionCreators: dataStore.getFlatActionCreators()
        }))
    // const store = createStoreWithMiddleware(rootReducer, initialState, autoRehydrate())

    store.subscribe(() => {
        console.log(store.getState().toJSON())
    })

    // persistStore(store, {storage: new AsyncNodeStorage(dataPath + '/data')})

    return store
}