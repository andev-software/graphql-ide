export default () => {

    function findHistoryQuery(state, {id}) {
        return state.getIn(['dataStore', 'historyQueriesById', id])
    }

    function findCollectionQuery(state, {id}) {
        return state.getIn(['dataStore', 'collectionQueriesById', id])
    }

    function findEnvironment(state, {id}) {
        return state.getIn(['dataStore', 'environmentsById', id])
    }

    function findTab(state, {id}) {
        return state.getIn(['dataStore', 'tabsById', id])
    }

    function findProject(state, {id}) {
        const project = state.getIn(['dataStore', 'projectsById', id])
        return readProject(state, project)
    }

    function allProjects(state) {
        return state.getIn(['dataStore', 'projects'])
            .map(id => {

                const project = findProject(state, {id})
                return readProject(state, project)
            })
    }

    function readProject(state, project) {

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
            collectionQueries: project.get('collectionQueryIds').map(id => {
                return findCollectionQuery(state, {id})
            }),
            historyQueries: project.get('historyQueryIds').map(id => {
                return findHistoryQuery(state, {id})
            }),
            environments: project.get('environmentIds').map(id => {
                return findEnvironment(state, {id})
            })
        })
    }

    return {
        allProjects,
        findProject
    }
}