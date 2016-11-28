import uuid from "uuid"
import moment from "moment"
import {fromJS, Map} from "immutable"

export default (store, selectors) => {
    return {
        createProject: ({data}) => {

            const id = uuid.v4()

            return {
                type: 'CREATE_PROJECT',
                payload: {
                    id: id,
                    data: fromJS({
                        id: id,
                        updatedAt: moment().utc().toISOString(),
                        createdAt: moment().utc().toISOString(),
                        variables: [],
                        headers: [],
                        selectedEnvironmentId: null,
                        environments: [],
                        selectedTabId: null,
                        tabs: [],
                        settings: {
                            queryMethod: 'POST',
                            topPane: {
                                state: null
                            },
                            leftPane: {
                                state: null
                            },
                            rightPane: {
                                state: null
                            }
                        }
                    }).merge(data)
                }
            }
        },
        updateProject: (payload) => ({
            type: 'UPDATE_PROJECT',
            payload
        }),
        projectUpdateTab: ({projectId, tabId, updateFn}) => {

            const project = selectors.findProject(store.getState(), {projectId})

            return {
                type: 'UPDATE_PROJECT',
                payload: {
                    id: projectId,
                    data: project.get('source').update('tabs', tabs => {
                        return tabs.map(tab => {
                            if (tab.get('id') === tabId) {
                                return updateFn(tab)
                            }
                            return tab
                        })
                    })
                }
            }
        },
        projectAddTab: ({projectId}) => {

            const project = selectors.findProject(store.getState(), {projectId})

            const tabId = uuid.v4()

            return {
                type: 'UPDATE_PROJECT',
                payload: {
                    id: projectId,
                    data: project.get('source').update('tabs', tabs => {
                        return tabs.push(Map({
                            id: tabId,
                            title: 'New query',
                            request: Map({
                                id: uuid.v4(),
                                query: '',
                                operationName: '',
                                variables: '',
                                loading: false
                            })
                        }))
                    })
                        .merge({
                            selectedTabId: tabId
                        })
                }
            }
        }
    }
}