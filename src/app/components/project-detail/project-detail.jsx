import React from 'react'
import moment from "moment"
import {introspectionQuery, buildClientSchema, print, parse} from 'graphql'
import {Map} from "immutable"
import debounce from "lodash/debounce"
import getQueryFacts from "graphiql/dist/utility/getQueryFacts"
import getOperationName from "app/components/graphiql/utils/get-operation-name"
import getOperationType from "app/components/graphiql/utils/get-operation-type"
import {DocExplorer} from 'graphiql/dist/components/DocExplorer';
import {connect} from "react-redux"
import {bindActionCreators} from "redux"
import swal from "sweetalert"
import get from "lodash/get"
import {createSelector} from "reselect"
import applyVariablesToHeaders from "app/utils/apply-variables-to-headers"

export default ({store, actionCreators, selectors, queries, factories, history, setupMenu, WorkspaceHeader, MenuItem, QueryList, Tabs, GraphiQL, ProjectPanel, EnvironmentPanel, QueryPanel}) => {

    const mapStateToProps = (state, props) => {

        const project = selectors.findProject(state, {id: props.params.id})
        const tabs = project.get('tabs').map(tab => Map({
            id: tab.get('id'),
            title: tab.getIn(['query', 'operationName']) || "<Unnamed>"
        }))

        return {
            project,
            tabs
        }
    }

    const mapDispatchToProps = dispatch => bindActionCreators(actionCreators, dispatch)

    class ProjectDetail extends React.Component {

        state = {
            width: 0,
            height: 0,
            schemaCache: Map(),
            variableToTypeCache: Map(),
            menu: null
        }

        componentDidMount() {
            window.addEventListener('resize', this.handleWindowResize)
            this.handleWindowResize()

            this.updateMenu()
        }

        componentDidUpdate() {
            this.updateMenu()
        }

        updateMenu() {

            const menu = this.getMenu(this.props.project)

            if (this.state.menu !== menu) {
                setupMenu(menu)
                this.setState({
                    menu
                })
            }
        }

        getMenu = createSelector([
            project => project.get('id'),
            project => project.get('leftPanel'),
            project => project.get('rightPanel'),
            project => project.get('bottomPanel'),
        ], (projectId, leftPanel, rightPanel, bottomPanel) => {

            const props = {
                projectId,
                leftPanel,
                rightPanel,
                bottomPanel
            }

            const createPanel = ({description, panelKey, panelValue}) => {

                const currentPanelValue = props[panelKey]

                return {
                    description,
                    checked: panelValue === currentPanelValue,
                    click: () => {

                        const data = {}
                        data[panelKey] = currentPanelValue === panelValue ? null : panelValue

                        this.props.projectsUpdate({
                            id: projectId,
                            data
                        })
                    }
                }
            }

            return {
                file: {
                    newTab: {
                        description: 'New Tab',
                        click: this.newTab
                    },
                    closeTab: {
                        description: 'Close Tab',
                        click: this.closeTab
                    },
                    clearHistoryQueries: {
                        description: 'Clear history queries',
                        click: this.clearHistoryQueries
                    },
                    clearCollectionQueries: {
                        description: 'Clear collection queries',
                        click: this.clearCollectionQueries
                    },
                },
                edit: {
                    prettifyQuery: {
                        description: 'Prettify',
                        click: this.handlePrettifyQuery
                    },
                    executeQuery: {
                        description: 'Execute',
                        click: this.runQuery
                    },
                    saveQuery: {
                        description: 'Save',
                        click: this.handleSaveQuery
                    },
                },
                view: {
                    panels: {
                        collection: createPanel({
                            description: 'Collection',
                            panelKey: 'leftPanel',
                            panelValue: 'COLLECTION'
                        }),
                        history: createPanel({
                            description: 'History',
                            panelKey: 'leftPanel',
                            panelValue: 'HISTORY'
                        }),
                        documentation: createPanel({
                            description: 'Documentation',
                            panelKey: 'rightPanel',
                            panelValue: 'DOCUMENTATION'
                        }),
                        project: createPanel({
                            description: 'Project',
                            panelKey: 'rightPanel',
                            panelValue: 'PROJECT'
                        }),
                        environment: createPanel({
                            description: 'Environment',
                            panelKey: 'rightPanel',
                            panelValue: 'ENVIRONMENT'
                        }),
                        query: createPanel({
                            description: 'Query',
                            panelKey: 'rightPanel',
                            panelValue: 'QUERY'
                        }),
                        queryVariables: createPanel({
                            description: 'Query variables',
                            panelKey: 'bottomPanel',
                            panelValue: 'QUERY_VARIABLES'
                        })
                    }
                }
            }
        })

        render() {

            const activeEnvironment = this.props.project.get('activeEnvironment')

            const leftPanel = this.props.project.get('leftPanel')

            const buttonsLeft = [{
                description: 'Back',
                onClick: () => history.push('/project-list')
            }, {
                description: get(this.state.menu, 'view.panels.collection.description'),
                active: get(this.state.menu, 'view.panels.collection.checked'),
                onClick: get(this.state.menu, 'view.panels.collection.click')
            }, {
                description: get(this.state.menu, 'view.panels.history.description'),
                active: get(this.state.menu, 'view.panels.history.checked'),
                onClick: get(this.state.menu, 'view.panels.history.click')
            }, {
                description: get(this.state.menu, 'edit.executeQuery.description'),
                onClick: get(this.state.menu, 'edit.executeQuery.click')
            }]

            if (this.props.project.getIn(['activeTab', 'query', 'type']) === 'HISTORY') {

                buttonsLeft.push({
                    description: get(this.state.menu, 'edit.saveQuery.description'),
                    onClick: get(this.state.menu, 'edit.saveQuery.click')
                })
            }
            const headerLeft = (
                <div className="Menu Menu--horizontal">
                    {buttonsLeft.map((item, key) => (
                        <MenuItem
                            key={key}
                            disabled={item.disabled}
                            active={item.active}
                            description={item.description}
                            onClick={item.onClick}
                        />
                    ))}
                </div>
            )

            const rightPanel = this.props.project.get('rightPanel')

            const buttonsRight = [{
                description: get(this.state.menu, 'view.panels.project.description'),
                active: get(this.state.menu, 'view.panels.project.checked'),
                onClick: get(this.state.menu, 'view.panels.project.click')
            }, {
                description: get(this.state.menu, 'view.panels.environment.description'),
                active: get(this.state.menu, 'view.panels.environment.checked'),
                onClick: get(this.state.menu, 'view.panels.environment.click')
            }, {
                description: get(this.state.menu, 'view.panels.query.description'),
                active: get(this.state.menu, 'view.panels.query.checked'),
                onClick: get(this.state.menu, 'view.panels.query.click')
            }, {
                description: get(this.state.menu, 'view.panels.documentation.description'),
                active: get(this.state.menu, 'view.panels.documentation.checked'),
                onClick: get(this.state.menu, 'view.panels.documentation.click')
            }]

            const headerRight = (
                <div className="Menu Menu--horizontal Menu--right">
                    {buttonsRight.map((item, key) => (
                        <MenuItem
                            key={key}
                            disabled={item.disabled}
                            active={item.active}
                            description={item.description}
                            onClick={item.onClick}
                        />
                    ))}
                </div>
            )

            const activeTab = this.props.project.get('activeTab')

            let variableToType

            if (activeTab) {
                this.state.variableToTypeCache.get(activeTab.getIn(['query', 'id']))

                if (!variableToType) {
                    const queryFacts = getQueryFacts(this.getSchema(), activeTab.getIn(['query', 'query']))
                    variableToType = queryFacts && queryFacts.variableToType
                    this.state.variableToTypeCache.set(activeTab.getIn(['query', 'id']), variableToType)
                }
            }

            const schema = this.getSchema()

            const {height, width} = this.state

            const HEADER_HEIGHT = 40
            const TABS_HEIGHT = 34
            const LEFT_PANEL_WIDTH = leftPanel !== null ? 350 : 0
            const LEFT_PANEL_HEIGHT = height - HEADER_HEIGHT - TABS_HEIGHT
            const RIGHT_PANEL_WIDTH = rightPanel !== null ? 350 : 0
            const RIGHT_PANEL_HEIGHT = height - HEADER_HEIGHT - TABS_HEIGHT

            return (
                <div className="ProjectDetail">
                    <WorkspaceHeader
                        width={width}
                        height={HEADER_HEIGHT}
                        left={headerLeft}
                        right={headerRight}
                    />
                    <div
                        className="Tabs__Holder"
                        style={{
                            position: 'absolute',
                            top: HEADER_HEIGHT,
                            width: width,
                            height: TABS_HEIGHT
                        }}
                    >
                        <Tabs
                            width={width}
                            height={TABS_HEIGHT}
                            activeId={this.props.project.get('activeTabId')}
                            tabs={this.props.tabs}
                            onClick={this.handleTabClick}
                            onRemove={this.handleTabRemove}
                            onAdd={this.handleTabAdd}
                        />
                    </div>
                    <div className="ProjectDetailContent"
                         style={{
                             top: HEADER_HEIGHT + TABS_HEIGHT,
                             height: height - HEADER_HEIGHT - TABS_HEIGHT
                         }}
                    >
                        {leftPanel !== null ? (
                            <div
                                className="ProjectDetail__LeftPanel"
                                style={{
                                    width: LEFT_PANEL_WIDTH,
                                    height: LEFT_PANEL_HEIGHT
                                }}
                            >
                                <QueryList
                                    data={this.props.project.get('queries')}
                                    rowHeight={72}
                                    activeId={activeTab && activeTab.get('queryId')}
                                    onItemClick={this.handleQueryClick}
                                    onItemRemove={this.handleQueryRemove}
                                />
                            </div>
                        ) : null}
                        <div
                            className="ProjectDetail__Workspace"
                            style={{
                                left: LEFT_PANEL_WIDTH,
                                width: width - LEFT_PANEL_WIDTH - RIGHT_PANEL_WIDTH,
                                height: height - HEADER_HEIGHT - TABS_HEIGHT
                            }}
                        >
                            <div
                                className="GraphiQL__Holder"
                                style={{
                                    width: width - LEFT_PANEL_WIDTH - RIGHT_PANEL_WIDTH,
                                    height: height - HEADER_HEIGHT - TABS_HEIGHT
                                }}
                            >
                                {activeTab ? (
                                    <GraphiQL
                                        ref={ref => this.graphiql = ref}
                                        variableEditorOpen={this.props.project.get('bottomPanel') === 'QUERY_VARIABLES'}
                                        variableEditorHeight={this.props.project.get('bottomPanelHeight')}
                                        schema={schema}
                                        onEditQuery={this.handleEditQuery}
                                        onEditVariables={this.handleEditVariables}
                                        onEditOperationName={this.handleEditOperationName}
                                        onRunQuery={this.handleEditorRunQuery}
                                        onOpenDocumentationWithType={this.handleOpenDocumentationWithType}
                                        onVariableEditorSettingsChange={this.handleVariableEditorSettingsChange}
                                        variableToType={variableToType}
                                        query={activeTab.getIn(['query', 'query']) || ''}
                                        operationName={activeTab.getIn(['query', 'operationName']) || ''}
                                        response={activeTab.getIn(['historyQuery', 'response']) || ''}
                                        variables={activeTab.getIn(['query', 'variables']) || ''}
                                        isWaitingForResponse={activeTab.get('loading')}
                                    />
                                ) : (
                                    <div className="Workspace__Empty">
                                        <div className="Workspace__EmptyMessage">
                                            Start by opening a tab
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {rightPanel !== null && (
                            <div
                                className="ProjectDetail__RightPanel"
                                style={{
                                    width: RIGHT_PANEL_WIDTH,
                                    height: RIGHT_PANEL_HEIGHT
                                }}
                            >
                                {rightPanel === 'PROJECT' && (
                                    <ProjectPanel
                                        width={RIGHT_PANEL_WIDTH}
                                        height={RIGHT_PANEL_HEIGHT}
                                        projectId={this.props.project.get('id')}
                                        onClose={this.handleRightPanelClose}
                                    />
                                )}
                                {rightPanel === 'ENVIRONMENT' && (
                                    <EnvironmentPanel
                                        width={RIGHT_PANEL_WIDTH}
                                        height={RIGHT_PANEL_HEIGHT}
                                        projectId={this.props.project.get('id')}
                                        environmentId={this.props.project.get('activeEnvironmentId')}
                                        onClose={this.handleRightPanelClose}
                                    />
                                )}
                                {rightPanel === 'QUERY' && (
                                    <QueryPanel
                                        width={RIGHT_PANEL_WIDTH}
                                        height={RIGHT_PANEL_HEIGHT}
                                        projectId={this.props.project.get('id')}
                                        queryId={this.props.project.getIn(['activeTab', 'queryId'])}
                                        onClose={this.handleRightPanelClose}
                                    />
                                )}
                                {(rightPanel === 'DOCUMENTATION') && (
                                    <div
                                        className="DocumentationPanel"
                                        style={{
                                            width: RIGHT_PANEL_WIDTH,
                                            height: RIGHT_PANEL_HEIGHT
                                        }}
                                    >
                                        {schema ? (
                                            <div
                                                className="docExplorerWrap"
                                                style={{
                                                    width: RIGHT_PANEL_WIDTH,
                                                    height: RIGHT_PANEL_HEIGHT
                                                }}
                                            >
                                                <DocExplorer
                                                    ref={c => {
                                                        this.docExplorerComponent = c;
                                                    }}
                                                    schema={schema}
                                                />
                                            </div>
                                        ) : (
                                            <div className="DocumentationPanel__Empty">
                                                <div className="DocumentationPanel__EmptyMessage">
                                                    Schema needed to display docs. Check the environment settings.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )
        }

        getSchema() {

            const activeEnvironment = this.props.project.get('activeEnvironment')

            if (!activeEnvironment) {
                return null
            }

            let schemaResponse = activeEnvironment.get('schemaResponse')

            if (!schemaResponse) {
                return null
            }

            let schema = this.state.schemaCache.get(schemaResponse)

            if (!schema) {
                schema = buildClientSchema(JSON.parse(schemaResponse))
            }

            return schema
        }

        handlePrettifyQuery = () => {

            const query = this.props.project.getIn(['activeTab', 'query'])

            if (query) {

                this.props.queriesUpdate({
                    id: query.get('id'),
                    data: {
                        query: print(parse(query.get('query')))
                    }
                })
            }
        }

        handleEditorRunQuery = () => {
            this.runQuery()
        }

        handleOpenDocumentationWithType = (type) => {
            this.docExplorerComponent.showDoc(type)
        }

        handleVariableEditorSettingsChange = ({open, height}) => {
            this.props.projectsUpdate({
                id: this.props.project.get('id'),
                data: {
                    bottomPanel: open ? 'QUERY_VARIABLES' : null,
                    bottomPanelHeight: height
                }
            })
        }

        runQuery = async() => {

            const activeEnvironment = this.props.project.get('activeEnvironment')
            const activeTab = this.props.project.get('activeTab')
            let query = activeTab.get('query')

            if (!activeEnvironment.get('schemaResponse')) {
                swal("Error", "No schema available. Check the environment settings", "error")
                return
            }

            const startTime = moment()

            this.props.tabsUpdate({
                id: activeTab.get('id'),
                data: {
                    loading: true
                }
            })

            const environmentVariables = activeEnvironment.get('variables')
            const projectHeaders = this.props.project.get('headers')
            const environmentHeaders = activeEnvironment.get('headers')
            const queryHeaders = query.get('headers')
            const mergedHeaders = projectHeaders
                .merge(environmentHeaders)
                .merge(queryHeaders)

            const headers = applyVariablesToHeaders(environmentVariables, mergedHeaders)

            const response = await queries.fetchQuery({
                url: activeEnvironment.get('url'),
                method: activeEnvironment.get('queryMethod'),
                headers: headers,
                params: {
                    query: query.get('query'),
                    operationName: query.get('operationName'),
                    variables: query.get('variables')
                }
            })

            const duration = +moment() - +startTime
            const responseString = JSON.stringify(response, null, 2)

            const queryType = query.get('type')

            if (queryType === 'HISTORY' || queryType === 'COLLECTION') {

                query = factories.createQuery().merge({
                    type: 'HISTORY',
                    title: query.get('title'),
                    query: query.get('query'),
                    operationType: query.get('operationType'),
                    operationName: query.get('operationName'),
                    variables: query.get('variables'),
                    headers: query.get('headers'),
                    duration,
                    response: responseString
                })

                this.props.queriesCreate({
                    id: query.get('id'),
                    data: query
                })

                this.props.tabsUpdate({
                    id: activeTab.get('id'),
                    data: {
                        historyQueryId: query.get('id')
                    }
                })

                this.props.projectsAttachHistoryQuery({
                    projectId: this.props.project.get('id'),
                    queryId: query.get('id')
                })

            } else {

                this.props.queriesUpdate({
                    id: query.get('id'),
                    data: {
                        type: 'HISTORY',
                        duration,
                        response: responseString
                    }
                })

                this.props.tabsUpdate({
                    id: activeTab.get('id'),
                    data: {
                        collectionQueryId: null,
                        historyQueryId: query.get('id')
                    }
                })

                this.props.projectsAttachHistoryQuery({
                    projectId: this.props.project.get('id'),
                    queryId: query.get('id')
                })
            }

            this.props.tabsUpdate({
                id: activeTab.get('id'),
                data: {
                    loading: false
                }
            })
        }

        newTab = () => {
            this.handleTabAdd()
        }

        closeTab = () => {

            const activeTabId = this.props.project.getIn(['activeTab', 'id'])

            if (!activeTabId) {
                return
            }

            this.handleTabRemove({
                id: activeTabId
            })
        }

        handleTabAdd = () => {

            const query = factories.createQuery().merge({
                type: 'NEW'
            })

            const tab = factories.createTab()

            this.props.queriesCreate({
                id: query.get('id'),
                data: query
            })

            this.props.tabsCreate({
                id: tab.get('id'),
                data: tab.merge({
                    historyQueryId: query.get('id')
                })
            })

            this.props.projectsAttachTab({
                projectId: this.props.project.get('id'),
                tabId: tab.get('id')
            })

            this.props.projectsUpdate({
                id: this.props.project.get('id'),
                data: {
                    activeTabId: tab.get('id')
                }
            })
        }

        handleTabClick = ({id}) => {

            this.props.projectsUpdate({
                id: this.props.project.get('id'),
                data: {
                    activeTabId: id
                }
            })
        }

        handleTabRemove = ({id}) => {

            const state = store.getState()
            const tab = selectors.findTab(state, {id})

            this.props.projectsDetachTab({
                projectId: this.props.project.get('id'),
                tabId: id
            })

            // Clean up query that has never been used
            if (tab.getIn(['query', 'type']) === 'NEW') {
                this.props.queriesRemove({
                    id: tab.get('queryId')
                })
            }

            this.props.tabsRemove({
                id
            })

            const tabIds = this.props.project.get('tabIds').filter(tabId => tabId !== id)
            const activeTabId = this.props.project.get('activeTabId')

            if (activeTabId === id && tabIds.last()) {

                this.props.projectsUpdate({
                    id: this.props.project.get('id'),
                    data: {
                        activeTabId: tabIds.last()
                    }
                })
            }
        }

        handleEditQuery = (query) => {

            this.props.queriesUpdate({
                id: this.props.project.getIn(['activeTab', 'queryId']),
                data: {
                    query
                }
            })

            this.updateQueryFacts()
        }

        updateQueryFacts = debounce(() => {

            const query = this.props.project.getIn(['activeTab', 'query'])

            const queryFacts = getQueryFacts(this.getSchema(), query.get('query'))

            this.setState({
                variableToTypeCache: this.state.variableToTypeCache.set(query.get('id'), queryFacts && queryFacts.variableToType)
            })

            this.props.queriesUpdate({
                id: query.get('id'),
                data: {
                    operationName: getOperationName(queryFacts),
                    operationType: getOperationType(queryFacts)
                }
            })

        }, 100)

        handleEditVariables = (variables) => {

            this.props.queriesUpdate({
                id: this.props.project.getIn(['activeTab', 'queryId']),
                data: {
                    variables
                }
            })
        }

        handleEditOperationName = (operationName) => {

            this.props.queriesUpdate({
                id: this.props.project.getIn(['activeTab', 'queryId']),
                data: {
                    operationName
                }
            })
        }

        handleQueryClick = ({id}) => {

            const state = store.getState()
            const query = selectors.findQuery(state, {id})

            let data = {
                historyQueryId: null,
                collectionQueryId: null
            }

            if (query.get('type') === 'HISTORY') {
                data = {
                    historyQueryId: query.get('id'),
                    collectionQueryId: null
                }
            }

            if (query.get('type') === 'COLLECTION') {
                data = {
                    collectionQueryId: query.get('id')
                }
            }

            let tab = this.props.project.get('activeTab')

            if (tab) {

                this.props.tabsUpdate({
                    id: tab.get('id'),
                    data
                })
            } else {

                tab = factories.createTab()

                this.props.tabsCreate({
                    id: tab.get('id'),
                    data: tab.merge(data)
                })

                this.props.projectsAttachTab({
                    projectId: this.props.project.get('id'),
                    tabId: tab.get('id')
                })

                this.props.projectsUpdate({
                    id: this.props.project.get('id'),
                    data: {
                        activeTabId: tab.get('id')
                    }
                })
            }
        }

        handleQueryRemove = ({id}) => {

            const state = store.getState()
            const query = selectors.findQuery(state, {id})

            if (query.get('type') === 'HISTORY') {

                this.props.projectsDetachHistoryQuery({
                    projectId: this.props.project.get('id'),
                    queryId: id
                })
            } else {

                this.props.projectsDetachCollectionQuery({
                    projectId: this.props.project.get('id'),
                    queryId: id
                })
            }

            // Remove tabs related to this query
            this.props.project.get('tabs').forEach(tab => {

                if (tab.get('historyQueryId') === id || tab.get('collectionQueryId') === id) {
                    this.props.projectsDetachTab({
                        projectId: this.props.project.get('id'),
                        tabId: tab.get('id')
                    })
                    this.props.tabsRemove({
                        id: tab.get('id')
                    })
                }
            })

            this.props.queriesRemove({
                id
            })
        }

        handleWindowResize = () => {
            this.setState({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }

        handleRightPanelClose = () => {

            this.props.projectsUpdate({
                id: this.props.project.get('id'),
                data: {
                    rightPanel: null
                }
            })
        }

        handleSaveQuery = () => {

            const query = this.props.project.getIn(['activeTab', 'query'])

            if (!query || query.get('type') !== 'HISTORY') {
                return
            }

            const collectionQuery = factories.createQuery().merge({
                type: 'COLLECTION',
                operationType: query.get('operationType'),
                operationName: query.get('operationName'),
                query: query.get('query'),
                variables: query.get('variables'),
                headers: query.get('headers')
            })

            this.props.queriesCreate({
                id: collectionQuery.get('id'),
                data: collectionQuery
            })

            this.props.projectsAttachCollectionQuery({
                projectId: this.props.project.get('id'),
                queryId: collectionQuery.get('id')
            })

            this.props.tabsUpdate({
                id: this.props.project.get('activeTabId'),
                data: {
                    queryId: collectionQuery.get('id')
                }
            })
        }

        clearHistoryQueries = () => {

            this.props.project.get('historyQueryIds').forEach(queryId => {
                this.handleQueryRemove({id: queryId})
            })
        }

        clearCollectionQueries = () => {

            this.props.project.get('collectionQueryIds').forEach(queryId => {
                this.handleQueryRemove({id: queryId})
            })
        }
    }

    return connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(ProjectDetail)
}