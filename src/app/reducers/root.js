import {combineReducers} from "redux-immutable"

export default (app, dataStore) => {

    return combineReducers({
        app,
        dataStore
    })
}