import {List, Map, fromJS} from "immutable"

function hydrateReducer(type) {

    return (state, action) => {

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
}

function createReducer(type) {

    return (state, action) => {

        let record = state.getIn([type + 'ById', action.payload.id])

        if (!record) {
            state = state.update(type + 'ById', cache => {
                return cache.set(action.payload.id, fromJS(action.payload.data))
            })
        }

        const ids = state.get(type)

        if (!ids.includes(action.payload.id)) {
            state = state.update(type, entities => entities.push(action.payload.id))
        }

        return state
    }
}

function updateReducer(type) {

    return (state, action) => {

        if (state.hasIn([type + 'ById', action.payload.id])) {
            return state.updateIn([type + 'ById', action.payload.id], record => {
                return record.merge(action.payload.data)
            })
        }

        return state
    }
}

function removeReducer(type) {

    return (state, action) => {

        if (state.hasIn([type + 'ById', action.payload.id])) {
            state = state.deleteIn([type + 'ById', action.payload.id])
        }

        const ids = state.get(type)

        if (ids.includes(action.payload.id)) {
            state = state.update(type, entities => entities.filter(id => id !== action.payload.id))
        }

        return state
    }
}

function clearReducer(type) {

    return (state, action) => {

        return state
            .update(type + 'ById', cache => {
                state.get(type).forEach(id => {
                    cache = cache.remove(id)
                })
                return cache
            })
            .update(type, () => List())
    }
}

export default class DataCollection {

    constructor(name) {
        this.name = name
        this.actions = Map()
    }

    action(name, handler) {
        this.actions = this.actions.set(name, handler)
        return this
    }

    createAction() {
        return this.action('CREATE', createReducer(this.name))
    }

    updateAction() {
        return this.action('UPDATE', updateReducer(this.name))
    }

    removeAction() {
        return this.action('REMOVE', removeReducer(this.name))
    }
}
