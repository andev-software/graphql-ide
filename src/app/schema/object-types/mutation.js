export default (resolvers) => {

    return {
        name: 'Mutation',
        fields: [{
            name: 'createEnvironment',
            type: 'Environment',
            args: [{
                name: 'input',
                type: 'CreateEnvironmentInput'
            }],
            resolvers: [
                resolvers.createEnvironment
            ]
        }, {
            name: 'createHistoryQuery',
            type: 'HistoryQuery',
            args: [{
                name: 'input',
                type: 'CreateHistoryQueryInput'
            }],
            resolvers: [
                resolvers.createHistoryQuery
            ]
        }, {
            name: 'createProject',
            type: 'Project',
            args: [{
                name: 'input',
                type: 'CreateProjectInput'
            }],
            resolvers: [
                resolvers.createProject
            ]
        }, {
            name: 'createSavedQuery',
            type: 'SavedQuery',
            args: [{
                name: 'input',
                type: 'CreateSavedQueryInput'
            }],
            resolvers: [
                resolvers.createSavedQuery
            ]
        }, {
            name: 'createQueryTab',
            type: 'QueryTab',
            args: [{
                name: 'input',
                type: 'CreateQueryTabInput'
            }],
            resolvers: [
                resolvers.createQueryTab
            ]
        }, {
            name: 'updateEnvironment',
            type: 'Environment',
            args: [{
                name: 'input',
                type: 'UpdateEnvironmentInput'
            }],
            resolvers: [
                resolvers.updateEnvironment
            ]
        }, {
            name: 'updateProject',
            type: 'Project',
            args: [{
                name: 'input',
                type: 'UpdateProjectInput'
            }],
            resolvers: [
                resolvers.updateProject
            ]
        }, {
            name: 'updateSavedQuery',
            type: 'SavedQuery',
            args: [{
                name: 'input',
                type: 'UpdateSavedQueryInput'
            }],
            resolvers: [
                resolvers.updateSavedQuery
            ]
        }, {
            name: 'removeSavedQuery',
            type: 'Boolean',
            args: [{
                name: 'id',
                type: 'ID'
            }],
            resolvers: [
                resolvers.removeSavedQuery
            ]
        }, {
            name: 'removeProjectQuery',
            type: 'Boolean',
            args: [{
                name: 'id',
                type: 'ID'
            }],
            resolvers: [
                resolvers.removeProject
            ]
        }, {
            name: 'removeHistoryQuery',
            type: 'Boolean',
            args: [{
                name: 'id',
                type: 'ID'
            }],
            resolvers: [
                resolvers.removeHistoryQuery
            ]
        }, {
            name: 'removeEnvironmentQuery',
            type: 'Boolean',
            args: [{
                name: 'id',
                type: 'ID'
            }],
            resolvers: [
                resolvers.removeEnvironment
            ]
        }, {
            name: 'removeQueryTab',
            type: 'Boolean',
            args: [{
                name: 'id',
                type: 'ID'
            }],
            resolvers: [
                resolvers.removeQueryTab
            ]
        }, {
            name: 'clearHistoryQueries',
            type: 'Boolean',
            args: [{
                name: 'projectId',
                type: 'ID'
            }],
            resolvers: [
                resolvers.clearHistoryQueries
            ]
        }]
    }
}