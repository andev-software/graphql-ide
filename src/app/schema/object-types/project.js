export default (resolvers) => {

    return {
        name: 'Project',
        fields: [{
            name: 'id',
            type: 'ID'
        }, {
            name: 'title',
            type: 'String'
        }, {
            name: 'headers',
            type: 'JSON'
        }, {
            name: 'updatedAt',
            type: 'DateTime'
        }, {
            name: 'createdAt',
            type: 'DateTime'
        }, {
            name: 'environments',
            type: 'Environment',
            isList: true,
            resolvers: [
                resolvers.projectEnvironments
            ]
        }, {
            name: 'historyQueries',
            type: 'HistoryQuery',
            isList: true,
            resolvers: [
                resolvers.projectHistoryQueries
            ]
        }, {
            name: 'savedQueries',
            type: 'SavedQuery',
            isList: true,
            resolvers: [
                resolvers.projectSavedQueries
            ]
        }, {
            name: 'queryTabs',
            type: 'QueryTab',
            isList: true,
            resolvers: [
                resolvers.projectQueryTabs
            ]
        }, {
            name: 'selectedTab',
            type: 'QueryTab'
        }, {
            name: 'selectedTabId',
            type: 'ID'
        }, {
            name: 'topPane',
            type: 'ProjectTopPane'
        }, {
            name: 'rightPane',
            type: 'ProjectRightPane'
        }, {
            name: 'leftPane',
            type: 'ProjectLeftPane'
        }]
    }
}