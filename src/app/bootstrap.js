export default di => {

    di.register({
        name: 'app',
        dependencies: [
            'app/components/RootView',
            'app/services/server',
            'app/handlers/setupMenu'
        ],
        factory: require('app').default
    })

    di.register({
        name: 'app/handlers/setupMenu',
        dependencies: [
            'app/services/store'
        ],
        factory: require('app/handlers/setup-menu').default
    })

    di.register({
        name: 'app/services/store',
        dependencies: [
            'app/reducers/root'
        ],
        factory: require('app/services/store').default
    })

    di.register({
        name: 'app/reducers/root',
        dependencies: [
            'app/reducers/app',
            'app/reducers/entities'
        ],
        factory: require('app/reducers/root').default
    })

    di.register({
        name: 'app/reducers/app',
        dependencies: [],
        factory: require('app/reducers/app').default
    })

    di.register({
        name: 'app/reducers/entities',
        dependencies: [],
        factory: require('app/reducers/entities').default
    })

    di.register({
        name: 'app/services/history',
        dependencies: [],
        factory: require('app/services/history').default
    })

    di.register({
        name: 'app/services/database',
        dependencies: [],
        factory: require('app/services/database').default
    })

    di.register({
        name: 'app/services/actions',
        dependencies: [
            'app/services/store',
            'app/services/selectors'
        ],
        factory: require('app/services/actions').default
    })

    di.register({
        name: 'app/services/selectors',
        dependencies: [],
        factory: require('app/services/selectors').default
    })

    di.register({
        name: 'app/services/fragments',
        dependencies: [
            'app/services/graphql'
        ],
        factory: require('app/services/fragments').default
    })

    di.register({
        name: 'app/services/queries',
        dependencies: [
            'app/services/graphql',
            'app/services/fragments'
        ],
        factory: require('app/services/queries').default
    })

    di.register({
        name: 'app/services/mutations',
        dependencies: [
            'app/services/graphql',
            'app/services/fragments'
        ],
        factory: require('app/services/mutations').default
    })

    di.register({
        name: 'app/services/resolvers',
        dependencies: [
            'app/services/database'
        ],
        factory: require('app/services/resolvers').default
    })

    di.register({
        name: 'app/services/graphql',
        dependencies: [
            'app/schema/schema'
        ],
        factory: require('app/services/graphql').default
    })

    di.register({
        name: 'app/services/server',
        dependencies: [
            'app/schema/schema'
        ],
        factory: require('app/services/server').default
    })

    di.register({
        name: 'app/schema/objectTypes/Environment',
        dependencies: [
            'app/services/resolvers'
        ],
        factory: require('app/schema/object-types/environment').default
    })

    di.register({
        name: 'app/schema/objectTypes/QueryTab',
        dependencies: [
            'app/services/resolvers'
        ],
        factory: require('app/schema/object-types/query-tab').default
    })

    di.register({
        name: 'app/schema/objectTypes/Query',
        dependencies: [],
        factory: require('app/schema/object-types/query').default
    })

    di.register({
        name: 'app/schema/objectTypes/Mutation',
        dependencies: [
            'app/services/resolvers'
        ],
        factory: require('app/schema/object-types/mutation').default
    })

    di.register({
        name: 'app/schema/objectTypes/Viewer',
        dependencies: [
            'app/services/resolvers'
        ],
        factory: require('app/schema/object-types/viewer').default
    })

    di.register({
        name: 'app/schema/objectTypes/Project',
        dependencies: [
            'app/services/resolvers'
        ],
        factory: require('app/schema/object-types/project').default
    })

    di.register({
        name: 'app/schema/objectTypes/SavedQuery',
        dependencies: [
            'app/services/resolvers'
        ],
        factory: require('app/schema/object-types/saved-query').default
    })

    di.register({
        name: 'app/schema/objectTypes/HistoryQuery',
        dependencies: [
            'app/services/resolvers'
        ],
        factory: require('app/schema/object-types/history-query').default
    })

    di.register({
        name: 'app/schema/objectTypes',
        dependencies: [
            'app/schema/objectTypes/Mutation',
            'app/schema/objectTypes/Query',
            'app/schema/objectTypes/Project',
            'app/schema/objectTypes/Environment',
            'app/schema/objectTypes/HistoryQuery',
            'app/schema/objectTypes/SavedQuery',
            'app/schema/objectTypes/QueryTab',
            'app/schema/objectTypes/Viewer'
        ],
        factory: (...objectTypes) => objectTypes
    })

    di.register({
        name: 'app/schema/enumTypes/QueryTabType',
        dependencies: [],
        factory: require('app/schema/enum-types/query-tab-type').default
    })

    di.register({
        name: 'app/schema/enumTypes/ProjectTopPane',
        dependencies: [],
        factory: require('app/schema/enum-types/project-top-pane').default
    })

    di.register({
        name: 'app/schema/enumTypes/ProjectLeftPane',
        dependencies: [],
        factory: require('app/schema/enum-types/project-left-pane').default
    })

    di.register({
        name: 'app/schema/enumTypes/ProjectRightPane',
        dependencies: [],
        factory: require('app/schema/enum-types/project-right-pane').default
    })

    di.register({
        name: 'app/schema/enumTypes',
        dependencies: [
            'app/schema/enumTypes/ProjectTopPane',
            'app/schema/enumTypes/ProjectLeftPane',
            'app/schema/enumTypes/ProjectRightPane',
            'app/schema/enumTypes/QueryTabType'
        ],
        factory: (...enumType) => enumType
    })

    di.register({
        name: 'app/schema/unionTypes/ProjectQuery',
        dependencies: [],
        factory: require('app/schema/union-types/project-query').default
    })

    di.register({
        name: 'app/schema/unionTypes',
        dependencies: [
            'app/schema/unionTypes/ProjectQuery'
        ],
        factory: (...unionTypes) => unionTypes
    })

    di.register({
        name: 'app/schema/inputObjectTypes/CreateEnvironmentInput',
        dependencies: [
            'app/services/resolvers'
        ],
        factory: require('app/schema/input-object-types/create-environment-input').default
    })

    di.register({
        name: 'app/schema/inputObjectTypes/CreateQueryTabInput',
        dependencies: [
            'app/services/resolvers'
        ],
        factory: require('app/schema/input-object-types/create-query-tab-input').default
    })

    di.register({
        name: 'app/schema/inputObjectTypes/CreateHistoryQueryInput',
        dependencies: [
            'app/services/resolvers'
        ],
        factory: require('app/schema/input-object-types/create-history-query-input').default
    })

    di.register({
        name: 'app/schema/inputObjectTypes/CreateProjectInput',
        dependencies: [
            'app/services/resolvers'
        ],
        factory: require('app/schema/input-object-types/create-project-input').default
    })

    di.register({
        name: 'app/schema/inputObjectTypes/CreateSavedQueryInput',
        dependencies: [
            'app/services/resolvers'
        ],
        factory: require('app/schema/input-object-types/create-saved-query-input').default
    })

    di.register({
        name: 'app/schema/inputObjectTypes/UpdateEnvironmentInput',
        dependencies: [
            'app/services/resolvers'
        ],
        factory: require('app/schema/input-object-types/update-environment-input').default
    })

    di.register({
        name: 'app/schema/inputObjectTypes/UpdateProjectInput',
        dependencies: [
            'app/services/resolvers'
        ],
        factory: require('app/schema/input-object-types/update-project-input').default
    })

    di.register({
        name: 'app/schema/inputObjectTypes/UpdateSavedQueryInput',
        dependencies: [
            'app/services/resolvers'
        ],
        factory: require('app/schema/input-object-types/update-saved-query-input').default
    })

    di.register({
        name: 'app/schema/inputObjectTypes',
        dependencies: [
            'app/schema/inputObjectTypes/CreateQueryTabInput',
            'app/schema/inputObjectTypes/CreateEnvironmentInput',
            'app/schema/inputObjectTypes/CreateHistoryQueryInput',
            'app/schema/inputObjectTypes/CreateProjectInput',
            'app/schema/inputObjectTypes/CreateSavedQueryInput',
            'app/schema/inputObjectTypes/UpdateEnvironmentInput',
            'app/schema/inputObjectTypes/UpdateProjectInput',
            'app/schema/inputObjectTypes/UpdateSavedQueryInput'
        ],
        factory: (...inputObjectTypes) => inputObjectTypes
    })

    di.register({
        name: 'app/schema/schema',
        dependencies: [
            'app/schema/unionTypes',
            'app/schema/enumTypes',
            'app/schema/inputObjectTypes',
            'app/schema/objectTypes'
        ],
        factory: require('app/schema/schema').default
    })

    di.register({
        name: 'app/services/importExport',
        dependencies: [
            'app/services/mutations',
            'app/services/queries'
        ],
        factory: require('app/services/import-export').default
    })

    di.register({
        name: 'app/components/tabs/TabAddButton',
        dependencies: [],
        factory: require('app/components/tabs/tab-add-button').default
    })

    di.register({
        name: 'app/components/tabs/TabItem',
        dependencies: [],
        factory: require('app/components/tabs/tab-item').default
    })

    di.register({
        name: 'app/components/tabs/Tabs',
        dependencies: [
            'app/components/tabs/TabItem',
            'app/components/tabs/TabAddButton'
        ],
        factory: require('app/components/tabs/tabs').default
    })

    di.register({
        name: 'app/components/layout/Layout',
        dependencies: [],
        factory: require('app/components/layout/layout').default
    })

    di.register({
        name: 'app/components/projectFormModal/ProjectFormModal',
        dependencies: [
            'app/components/endpointsEditor/EndpointsEditor'
        ],
        factory: require('app/components/project-form-modal/project-form-modal').default
    })

    di.register({
        name: 'app/components/graphiql/GraphiQL',
        dependencies: [],
        factory: require('app/components/graphiql/graphiql').default
    })

    di.register({
        name: 'app/components/queryList/QueryListItem',
        dependencies: [],
        factory: require('app/components/query-list/query-list-item').default
    })

    di.register({
        name: 'app/components/queryList/QueryList',
        dependencies: [
            'app/components/queryList/QueryListItem'
        ],
        factory: require('app/components/query-list/query-list').default
    })

    di.register({
        name: 'app/components/workspace/WorkspaceHeader',
        dependencies: [],
        factory: require('app/components/workspace/workspace-header').default
    })

    di.register({
        name: 'app/components/workspace/MenuItem',
        dependencies: [],
        factory: require('app/components/workspace/menu-item').default
    })


    di.register({
        name: 'app/components/headerEditor/HeaderItem',
        dependencies: [],
        factory: require('app/components/header-editor/header-item').default
    })

    di.register({
        name: 'app/components/headerEditor/HeaderEditor',
        dependencies: [
            'app/components/headerEditor/HeaderItem'
        ],
        factory: require('app/components/header-editor/header-editor').default
    })

    di.register({
        name: 'app/components/variableEditor/VariableItem',
        dependencies: [],
        factory: require('app/components/variable-editor/variable-item').default
    })

    di.register({
        name: 'app/components/variableEditor/VariableEditor',
        dependencies: [
            'app/components/variableEditor/VariableItem'
        ],
        factory: require('app/components/variable-editor/variable-editor').default
    })


    di.register({
        name: 'app/components/endpointsEditor/EndpointsItem',
        dependencies: [],
        factory: require('app/components/endpoints-editor/endpoints-item').default
    })

    di.register({
        name: 'app/components/endpointsEditor/EndpointsEditor',
        dependencies: [
            'app/components/endpointsEditor/EndpointsItem'
        ],
        factory: require('app/components/endpoints-editor/endpoints-editor').default
    })

    di.register({
        name: 'app/components/projectDetail/ProjectDetail',
        dependencies: [
            'app/services/queries',
            'app/services/mutations',
            'app/services/selectors',
            'app/services/history',
            'app/components/view',
            'app/components/layout/Layout',
            'app/components/workspace/WorkspaceHeader',
            'app/components/workspace/MenuItem',
            'app/components/variableEditor/VariableEditor',
            'app/components/headerEditor/HeaderEditor',
            'app/components/queryList/QueryList',
            'app/components/tabs/Tabs',
            'app/components/graphiql/GraphiQL',
            'app/components/projectFormModal/ProjectFormModal'
        ],
        factory: require('app/components/project-detail/project-detail').default
    })

    di.register({
        name: 'app/components/projectList/ProjectList',
        dependencies: [
            'app/services/queries',
            'app/services/importExport',
            'app/services/history',
            'app/components/view',
            'app/components/layout/Layout',
            'app/components/workspace/WorkspaceHeader',
            'app/components/workspace/MenuItem',
            'app/components/projectList/ProjectListItem',
            'app/components/projectFormModal/ProjectFormModal'
        ],
        factory: require('app/components/project-list/project-list').default
    })

    di.register({
        name: 'app/components/projectList/ProjectListItem',
        dependencies: [],
        factory: require('app/components/project-list/project-list-item').default
    })

    di.register({
        name: 'app/components/loader/Loader',
        dependencies: [],
        factory: require('app/components/loader/loader').default
    })


    di.register({
        name: 'app/components/view',
        dependencies: [
            'app/components/loader/Loader'
        ],
        factory: require('app/components/view').default
    })


    di.register({
        name: 'app/components/LayoutView',
        dependencies: [],
        factory: require('app/components/layout-view').default
    })

    di.register({
        name: 'app/components/RouterView',
        dependencies: [
            'app/services/history',
            'app/components/LayoutView',
            'app/components/projectList/ProjectList',
            'app/components/projectDetail/ProjectDetail'
        ],
        factory: require('app/components/router-view').default
    })

    di.register({
        name: 'app/components/RootView',
        dependencies: [
            'app/services/store',
            'app/components/RouterView'
        ],
        factory: require('app/components/root-view').default
    })
}