import {Map} from "immutable"

export default () => {

    const INITIAL_STATE = Map({
        version: "1.0"
    })

    return (state = INITIAL_STATE) => {
        return state
    }
}