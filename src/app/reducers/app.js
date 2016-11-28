import {Map} from "immutable"

export default () => {

    const INITIAL_STATE = Map({
        version: 0
    })

    return (state = INITIAL_STATE, action) => {

        console.log({
            state,
            action
        })

        switch (action.type) {
            case 'BUMP_VERSION':
                console.log('state', state)
                console.log('version', state.get('version'))
                return state.set('version', state.get('version') + 1)
            default:
                return state
        }
    }
}