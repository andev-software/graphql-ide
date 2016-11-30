import {Map} from "immutable"

export default () => {

    const INITIAL_STATE = Map({
        version: 0
    })

    return (state = INITIAL_STATE, action) => {

        switch (action.type) {
            case 'BUMP_VERSION':
                return state.set('version', state.get('version') + 1)
            default:
                return state
        }
    }
}