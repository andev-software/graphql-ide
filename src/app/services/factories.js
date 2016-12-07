import {Map, List} from "immutable"
import uuid from "uuid"
import moment from "moment"

export default () => {

    return {
        createQuery() {

            return Map({
                id: uuid.v4(),
                type: null,
                title: null,
                operationName: null,
                operationType: null,
                query: null,
                variables: null,
                response: null,
                duration: null,
                headers: Map({}),
                updatedAt: moment().utc().toISOString(),
                createdAt: moment().utc().toISOString()
            })
        },
        createEnvironment() {

            return Map({
                id: uuid.v4(),
                title: 'Default',
                url: '',
                queryMethod: 'POST',
                variables: Map({}),
                headers: Map({}),
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
                leftPanel: null,
                rightPanel: null,
                bottomPanel: null,
                bottomPanelHeight: 200,
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
                queryId: '',
                loading: false
            })
        }
    }
}