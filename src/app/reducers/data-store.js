function importReducer(state, action) {

    const {payload} = action

    const types = ['projects', 'environments', 'queries']

    types.forEach(type => {

        state = state
            .update(type + 'ById', cache => {
                return cache.merge(payload.get(type + 'ById'))
            })
            .update(type, cache => {
                return cache.concat(payload.get(type))
            })
    })

    return state
}

export default (dataStore) => {

    const initialState = dataStore.getInitialState()
    const actions = dataStore.getActions()

    return (state = initialState, action) => {

        const handler = actions.get(action.type)

        if (handler) {
            return handler(state, action)
        }

        switch (action.type) {

            case 'IMPORT':
                return importReducer(state, action)
        }

        return state
    }
}