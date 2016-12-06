import moment from "moment"
import {List} from "immutable"

export default () => {

    function findQuery(state, {id}) {
        return state.getIn(['dataStore', 'queriesById', id])
    }

    function findEnvironment(state, {id}) {
        return state.getIn(['dataStore', 'environmentsById', id])
    }

    function findTab(state, {id}) {
        const tab = state.getIn(['dataStore', 'tabsById', id])
        return tab ? readTab(state, tab) : null
    }

    function findProject(state, {id}) {
        const project = state.getIn(['dataStore', 'projectsById', id])
        return project ? readProject(state, project) : null
    }

    function allProjects(state) {
        return state.getIn(['dataStore', 'projects'])
            .map(id => findProject(state, {id}))
    }

    function readTab(state, tab) {

        const queryId = tab.get('collectionQueryId') || tab.get('historyQueryId')

        return tab.merge({
            queryId: queryId,
            query: findQuery(state, {id: queryId}),
            collectionQuery: findQuery(state, {id: tab.get('collectionQueryId')}),
            historyQuery: findQuery(state, {id: tab.get('historyQueryId')})
        })
    }

    function readProject(state, project) {

        const historyQueries = project.get('historyQueryIds').map(id => {
            return findQuery(state, {id})
        })

        const collectionQueries = project.get('collectionQueryIds').map(id => {
            return findQuery(state, {id})
        })

        let queries = List()

        switch (project.get('leftPanel')) {
            case 'COLLECTION':
                queries = collectionQueries
                break
            case 'HISTORY':
                queries = historyQueries
                break
        }

        queries = queries.sort((a, b) => {
            return b.get('updatedAt').localeCompare(a.get('updatedAt'))
        })

        queries = queries.map(query => query.merge({
            title: query.get('operationName') || '<Unnamed>',
            shortname: (query.get('operationType') || "").substring(0, 2),
            meta: moment(query.get('updatedAt')).from(moment()),
            subMeta: query.get('duration') ? query.get('duration') + 'ms' : null,
        }))

        return project.merge({
            activeEnvironment: findEnvironment(state, {
                id: project.get('activeEnvironmentId')
            }),
            activeTab: findTab(state, {
                id: project.get('activeTabId')
            }),
            tabs: project.get('tabIds').map(id => {
                return findTab(state, {id})
            }),
            collectionQueries,
            historyQueries,
            queries,
            environments: project.get('environmentIds').map(id => {
                return findEnvironment(state, {id})
            })
        })
    }

    return {
        allProjects,
        findProject,
        findEnvironment,
        findQuery,
        findTab
    }
}