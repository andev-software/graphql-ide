export default di => {

    di.register({
        name: 'app',
        dependencies: [
            'app/components/RootView'
        ],
        factory: require('app').default
    })

    di.register({
        name: 'app/config',
        dependencies: [],
        factory: require('app/config').default
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
            'app/services/dataStore',
            'app/services/actualizeState'
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
        name: 'app/services/actualizeState',
        dependencies: [],
        factory: require('app/services/actualize-state').default
    })

    di.register({
        name: 'app/services/importExport',
        dependencies: [
            'app/services/store',
            'app/config',
            'app/services/factories'
        ],
        namedParams: true,
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
        name: 'app/components/projectPanel/ProjectPanel',
        dependencies: [
            'app/services/factories',
            'app/services/actionCreators',
            'app/services/selectors',
            'app/components/mapEditor/MapEditor',
            'app/components/panel/Panel',
            'app/components/panel/PanelHeader',
            'app/components/panel/PanelBody'
        ],
        namedParams: true,
        factory: require('app/components/project-panel/project-panel').default
    })

    di.register({
        name: 'app/components/queryPanel/QueryPanel',
        dependencies: [
            'app/services/actionCreators',
            'app/services/selectors',
            'app/components/mapEditor/MapEditor',
            'app/components/panel/Panel',
            'app/components/panel/PanelHeader',
            'app/components/panel/PanelBody',
            'app/components/panel/PanelFooter'
        ],
        namedParams: true,
        factory: require('app/components/query-panel/query-panel').default
    })

    di.register({
        name: 'app/components/environmentPanel/EnvironmentPanel',
        dependencies: [
            'app/services/actionCreators',
            'app/services/selectors',
            'app/services/queries',
            'app/components/mapEditor/MapEditor',
            'app/components/panel/Panel',
            'app/components/panel/PanelHeader',
            'app/components/panel/PanelBody'
        ],
        namedParams: true,
        factory: require('app/components/environment-panel/environment-panel').default
    })

    di.register({
        name: 'app/components/panel/Panel',
        dependencies: [],
        factory: require('app/components/panel/panel').default
    })

    di.register({
        name: 'app/components/panel/PanelHeader',
        dependencies: [],
        factory: require('app/components/panel/panel-header').default
    })

    di.register({
        name: 'app/components/panel/PanelBody',
        dependencies: [],
        factory: require('app/components/panel/panel-body').default
    })

    di.register({
        name: 'app/components/panel/PanelFooter',
        dependencies: [],
        factory: require('app/components/panel/panel-footer').default
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
        name: 'app/components/mapEditor/MapItem',
        dependencies: [],
        factory: require('app/components/map-editor/map-item').default
    })

    di.register({
        name: 'app/components/mapEditor/MapEditor',
        dependencies: [
            'app/components/mapEditor/MapItem'
        ],
        factory: require('app/components/map-editor/map-editor').default
    })

    di.register({
        name: 'app/components/projectDetail/ProjectDetail',
        dependencies: [
            'app/services/store',
            'app/services/actionCreators',
            'app/services/selectors',
            'app/services/queries',
            'app/services/factories',
            'app/services/history',
            'app/handlers/setupMenu',
            'app/components/workspace/WorkspaceHeader',
            'app/components/workspace/MenuItem',
            'app/components/queryList/QueryList',
            'app/components/tabs/Tabs',
            'app/components/graphiql/GraphiQL',
            'app/components/projectPanel/ProjectPanel',
            'app/components/environmentPanel/EnvironmentPanel',
            'app/components/queryPanel/QueryPanel'
        ],
        namedParams: true,
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
            'app/components/projectList/ProjectListItem'
        ],
        namedParams: true,
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