export default di => {

    di.register({
        name: 'app',
        dependencies: [
            'app/components/RootView',
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
        name: 'app/services/dataStore',
        dependencies: [],
        factory: require('app/services/data-store').default
    })

    di.register({
        name: 'app/services/store',
        dependencies: [
            'app/reducers/root',
            'app/services/dataStore'
        ],
        factory: require('app/services/store').default
    })

    di.register({
        name: 'app/reducers/root',
        dependencies: [
            'app/reducers/app',
            'app/reducers/dataStore'
        ],
        factory: require('app/reducers/root').default
    })

    di.register({
        name: 'app/reducers/app',
        dependencies: [],
        factory: require('app/reducers/app').default
    })

    di.register({
        name: 'app/services/actionCreators',
        dependencies: [
            'app/services/dataStore'
        ],
        factory: (dataStore) => {
            return dataStore.getFlatActionCreators()
        }
    })

    di.register({
        name: 'app/reducers/dataStore',
        dependencies: [
            'app/services/dataStore'
        ],
        factory: require('app/reducers/data-store').default
    })

    di.register({
        name: 'app/services/history',
        dependencies: [],
        factory: require('app/services/history').default
    })

    di.register({
        name: 'app/services/factories',
        dependencies: [],
        factory: require('app/services/factories').default
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
        name: 'app/services/queries',
        dependencies: [
            'app/services/database'
        ],
        factory: require('app/services/queries').default
    })

    di.register({
        name: 'app/services/mutations',
        dependencies: [
            'app/services/database'
        ],
        factory: require('app/services/mutations').default
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
        name: 'app/components/projectEditModal/ProjectEditModal',
        dependencies: [
            'app/services/store',
            'app/services/selectors',
            'app/services/actionCreators',
            'app/components/projectFormModal/ProjectFormModal'
        ],
        factory: require('app/components/project-edit-modal/project-edit-modal').default
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
            'app/services/actionCreators',
            'app/services/selectors',
            'app/services/factories',
            'app/services/history',
            'app/components/loader/Loader',
            'app/components/layout/Layout',
            'app/components/workspace/WorkspaceHeader',
            'app/components/workspace/MenuItem',
            'app/components/variableEditor/VariableEditor',
            'app/components/headerEditor/HeaderEditor',
            'app/components/queryList/QueryList',
            'app/components/tabs/Tabs',
            'app/components/graphiql/GraphiQL',
            'app/components/projectEditModal/ProjectEditModal'
        ],
        factory: require('app/components/project-detail/project-detail').default
    })

    di.register({
        name: 'app/components/projectList/ProjectList',
        dependencies: [
            'app/services/actionCreators',
            'app/services/selectors',
            'app/services/factories',
            'app/services/importExport',
            'app/services/history',
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