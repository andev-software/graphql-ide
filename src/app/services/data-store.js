import DataStore from "app/data/data-store"
import DataCollection from "app/data/data-collection"

function attachReducer({type, listProperty, localKey, foreignKey}) {

    return (state, action) => {

        const localId = action.payload[localKey]
        const foreignId = action.payload[foreignKey]

        let item = state.getIn([type + 'ById', localId])

        if (item) {

            item = item.update(listProperty, ids => {

                if (!ids.includes(foreignId)) {
                    return ids.push(foreignId)
                }
                return ids
            })

            state = state.setIn([type + 'ById', localId], item)
        }

        return state
    }
}

function detachReducer({type, listProperty, localKey, foreignKey}) {

    return (state, action) => {

        const localId = action.payload[localKey]
        const foreignId = action.payload[foreignKey]

        let item = state.getIn([type + 'ById', localId])

        if (item) {

            item = item.update(listProperty, ids => {
                return ids.filter(id => id !== foreignId)
            })

            state = state.setIn([type + 'ById', localId], item)
        }

        return state
    }
}

export default () => {

    return new DataStore()
        .collection(new DataCollection('projects')
            .createAction()
            .updateAction()
            .removeAction()
            .action('ATTACH_TAB', attachReducer({
                type: 'projects',
                listProperty: 'tabIds',
                localKey: 'projectId',
                foreignKey: 'tabId'
            }))
            .action('DETACH_TAB', detachReducer({
                type: 'projects',
                listProperty: 'tabIds',
                localKey: 'projectId',
                foreignKey: 'tabId'
            }))
            .action('ATTACH_ENVIRONMENT', attachReducer({
                type: 'projects',
                listProperty: 'environmentIds',
                localKey: 'projectId',
                foreignKey: 'environmentId'
            }))
            .action('DETACH_ENVIRONMENT', detachReducer({
                type: 'projects',
                listProperty: 'environmentIds',
                localKey: 'projectId',
                foreignKey: 'environmentId'
            }))
        )
        .collection(new DataCollection('tabs')
            .createAction()
            .updateAction()
            .removeAction()
        )
        .collection(new DataCollection('environments')
            .createAction()
            .updateAction()
            .removeAction()
        )
        .collection(new DataCollection('collectionQueries')
            .createAction()
            .updateAction()
            .removeAction()
        )
        .collection(new DataCollection('historyQueries')
            .createAction()
            .updateAction()
            .removeAction()
        )
}