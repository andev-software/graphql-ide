import {List, Map} from "immutable"

function hydrateEntities(type, state, action) {

    let ids = List()
    let records = Map()

    action.payload.forEach(entity => {
        records = records.set(entity.get('id'), entity)
        ids = ids.push(entity.get('id'))
    })

    return state
        .update(type + 'ById', cache => cache.merge(records))
        .update(type, () => ids)
}

function createEntity(type, state, action) {

    let record = state.getIn([type + 'ById', action.payload.id])

    if (!record) {
        state = state.update(type + 'ById', cache => {
            return cache.set(action.payload.id, action.payload.data)
        })
    }

    const ids = state.get(type)

    if (!ids.includes(action.payload.id)) {
        state = state.update(type, entities => entities.push(action.payload.id))
    }

    return state
}

function updateEntity(type, state, action) {

    if (state.hasIn([type + 'ById', action.payload.id])) {
        return state.updateIn([type + 'ById', action.payload.id], record => {
            return record.merge(action.payload.data)
        })
    }

    return state
}

function removeEntity(type, state, action) {

    if (state.hasIn([type + 'ById', action.payload.id])) {
        state = state.deleteIn([type + 'ById', action.payload.id])
    }

    const ids = state.get(type)

    if (ids.includes(action.payload.id)) {
        state = state.update(type, entities => entities.filter(id => id !== action.payload.id))
    }

    return state
}

function clearEntities(type, state, action) {

    return state
        .update(type + 'ById', cache => {
            state.get(type).forEach(id => {
                cache = cache.remove(id)
            })
            return cache
        })
        .update(type, () => List())
}

export default () => {

    const INITIAL_STATE = Map({
        projectsById: Map(),
        projects: List()
    })

    return (state = INITIAL_STATE, action) => {

        switch (action.type) {
            case 'HYDRATE_PROJECTS':
                return hydrateEntities('projects', state, action)
            case 'CLEAR_PROJECTS':
                return clearEntities('projects', state, action)
            case 'CREATE_PROJECT':
                return createEntity('projects', state, action)
            case 'UPDATE_PROJECT':
                return updateEntity('projects', state, action)
            case 'REMOVE_PROJECT':
                return removeEntity('projects', state, action)
            default:
                return state
        }
    }
}