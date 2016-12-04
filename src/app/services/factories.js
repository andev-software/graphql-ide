import {Map, List} from "immutable"
import uuid from "uuid"

export default () => {

    return {
        createEnvironment() {

            return Map({
                id: uuid.v4(),
                title: '',
                url: '',
                queryMethod: 'POST',
                variables: Map({}),
                schemaResponse: null,
                schemaUpdatedAt: null
            })
        },
        createProject() {

            return Map({
                id: uuid.v4(),
                title: '',
                description: '',
                activeEnvironmentId: null,
                activeTabId: null,
                topPanel: null,
                leftPanel: null,
                rightPanel: null,
                headers: Map(),
                tabIds: List(),
                environmentIds: List(),
                historyQueryIds: List(),
                collectionQueryIds: List()
            })
        },
        createTab() {

            return Map({
                id: uuid.v4(),
                query: '',
                operationName: '',
                variables: '',
                loading: false
            })
        }
    }
}