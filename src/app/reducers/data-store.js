export default (dataStore) => {

    const initialState = dataStore.getInitialState()
    const actions = dataStore.getActions()

    return (state = initialState, action) => {

        const handler = actions.get(action.type)

        if (handler) {
            return handler(state, action)
        }

        return state
    }
}