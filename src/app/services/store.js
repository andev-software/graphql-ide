import electron from "electron"
import {Map} from "immutable"
import {createStore, applyMiddleware, compose} from "redux"
import thunk from "redux-thunk"
import createLogger from "redux-logger"
import {persistStore, autoRehydrate} from 'redux-persist-immutable'
import {AsyncNodeStorage} from 'redux-persist-node-storage'

export default (rootReducer) => {

    const dataPath = electron.remote.app.getPath('userData')

    const initialState = Map()

    console.log('initial state', initialState)

    const logger = createLogger()

    const createStoreWithMiddleware = applyMiddleware(thunk, logger)(createStore)

    // const store = createStore(rootReducer, initialState, compose(applyMiddleware(, thunk)))
    const store = createStoreWithMiddleware(rootReducer, initialState, autoRehydrate())
    // persistStore(store, {
    //     storage: {
    //         getAllKeys: () => {
    //             console.log('get all keys')
    //         },
    //         getItem: (key) => {
    //             console.log('get item key', key)
    //         },
    //         setItem: (key, value) => {
    //             console.log('set item key', key, 'value', value)
    //         },
    //         removeItem: (key) => {
    //             console.log('remove item key', key)
    //         }
    //     }
    // })

    store.subscribe(() => {
        console.log(store.getState().toJSON())
    })

    console.log(dataPath + '/data')

    persistStore(store, {storage: new AsyncNodeStorage(dataPath + '/data')})

    return store
}