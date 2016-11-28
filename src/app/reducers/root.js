import {combineReducers} from "redux-immutable"

export default (app, entities) => {
    return combineReducers({
        app,
        entities
    })
}