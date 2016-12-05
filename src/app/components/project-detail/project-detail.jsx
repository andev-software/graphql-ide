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

function applyVariablesToHeaders(project) {

    const headers = project.get('headers')
    const variables = project.get('variables')

    return headers.reduce((result, header) => {

        const headerKey = header.get('key')
        let headerValue = header.get('value')

        variables.forEach(variable => {
            const varKey = variable.get('key')
            const varValue = variable.get('value')
            headerValue = headerValue.replace(`{{${varKey}}}`, varValue)
        })

        result[headerKey] = headerValue

        return result
    }, {})
}

function transformHeaders({headers}) {

    return headers.reduce((result, header) => {
        result[header.get('key')] = header.get('value')
        return result
    }, {})
}

export default ({store, actionCreators, selectors, queries, factories, history, WorkspaceHeader, MenuItem, QueryList, Tabs, GraphiQL, ProjectPanel, EnvironmentPanel, QueryPanel}) => {

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
            schemaCache: Map()
        }

        componentDidMount() {
            window.addEventListener('resize', this.handleWindowResize)
            this.handleWindowResize()
        }

        render() {

            const activeEnvironment = this.props.project.get('activeEnvironment')

            const projectId = this.props.project.get('id')
            const leftPanel = this.props.project.get('leftPanel')

            const buttonsLeft = [{
                description: 'Back',
                onClick: () => history.push('/project-list')
            }, {
                description: 'Collection',
                active: leftPanel === 'COLLECTION',
                onClick: () => {
                    this.props.projectsUpdate({
                        id: projectId,
                        data: {
                            leftPanel: leftPanel === 'COLLECTION' ? null : 'COLLECTION'
                        }
                    })
                }
            }, {
                description: 'History',
                active: leftPanel === 'HISTORY',
                onClick: () => {
                    this.props.projectsUpdate({
                        id: projectId,
                        data: {
                            leftPanel: leftPanel === 'HISTORY' ? null : 'HISTORY'
                        }
                    })
                }
            }, {
                description: 'Run',
                disabled: !this.props.project.get('activeTab'),
                onClick: () => this.runQuery()
            }, {
                description: 'Prettify',
                disabled: !this.props.project.get('activeTab'),
                onClick: () => this.handlePrettifyQuery()
            }]

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
                description: 'Documentation',
                active: rightPanel === 'DOCUMENTATION',
                onClick: () => {
                    this.props.projectsUpdate({
                        id: projectId,
                        data: {
                            rightPanel: rightPanel === 'DOCUMENTATION' ? null : 'DOCUMENTATION'
                        }
                    })
                }
            }, {
                description: 'Project',
                active: rightPanel === 'PROJECT',
                onClick: () => {
                    this.props.projectsUpdate({
                        id: projectId,
                        data: {
                            rightPanel: rightPanel === 'PROJECT' ? null : 'PROJECT'
                        }
                    })
                }
            }, {
                description: 'Environment',
                active: rightPanel === 'ENVIRONMENT',
                onClick: () => {

                    if (activeEnvironment) {

                        this.props.projectsUpdate({
                            id: projectId,
                            data: {
                                rightPanel: rightPanel === 'ENVIRONMENT' ? null : 'ENVIRONMENT'
                            }
                        })
                    }
                }
            }, {
                description: 'Query',
                active: rightPanel === 'QUERY',
                onClick: () => {
                    this.props.projectsUpdate({
                        id: projectId,
                        data: {
                            rightPanel: rightPanel === 'QUERY' ? null : 'QUERY'
                        }
                    })
                }
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
                                {schema && activeTab ? (
                                    <GraphiQL
                                        ref={ref => this.graphiql = ref}
                                        schema={schema}
                                        onEditQuery={this.handleEditQuery}
                                        onEditVariables={this.handleEditVariables}
                                        onEditOperationName={this.handleEditOperationName}
                                        onRunQuery={this.handleEditorRunQuery}
                                        query={activeTab.getIn(['query', 'query']) || ''}
                                        operationName={activeTab.getIn(['query', 'operationName']) || ''}
                                        response={activeTab.getIn(['query', 'response']) || ''}
                                        variables={activeTab.getIn(['query', 'variables']) || ''}
                                        isWaitingForResponse={activeTab.get('loading')}
                                    />
                                ) : (
                                    <div>
                                        Empty
                                    </div>
                                )}
                            </div>
                        </div>
                        {rightPanel !== null && (
                            <div className="ProjectDetail__RightPanel">
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
                                        environmentId={this.props.project.get('activeEnvironmentId')}
                                        onClose={this.handleRightPanelClose}
                                    />
                                )}
                                {rightPanel === 'QUERY' && (
                                    <QueryPanel
                                        width={RIGHT_PANEL_WIDTH}
                                        height={RIGHT_PANEL_HEIGHT}
                                        queryId={this.props.project.getIn(['activeTab', 'queryId'])}
                                        onClose={this.handleRightPanelClose}
                                    />
                                )}
                                {(rightPanel === 'DOCUMENTATION' && schema) && (
                                    <div
                                        className="DocExplorerPane"
                                        style={{
                                            width: RIGHT_PANEL_WIDTH,
                                            height: RIGHT_PANEL_HEIGHT
                                        }}
                                    >
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

            const activeTab = this.props.project.get('activeTab')

            if (activeTab) {

                const query = activeTab.get('query')

                this.props.tabsUpdate({
                    id: activeTab.get('id'),
                    data: {
                        query: print(parse(query))
                    }
                })
            }
        }

        handleEditorRunQuery = () => {
            this.runQuery()
        }

        runQuery = async() => {

            const activeEnvironment = this.props.project.get('activeEnvironment')
            const activeTab = this.props.project.get('activeTab')
            let query = activeTab.get('query')

            const startTime = moment()

            this.props.tabsUpdate({
                id: activeTab.get('id'),
                data: {
                    loading: true
                }
            })

            const response = await queries.fetchQuery({
                url: activeEnvironment.get('url'),
                method: activeEnvironment.get('queryMethod'),
                headers: applyVariablesToHeaders(this.props.project),
                params: {
                    query: query.get('query'),
                    operationName: query.get('operationName'),
                    variables: query.get('variables')
                }
            })

            const duration = +moment() - +startTime
            const responseString = JSON.stringify(response, null, 2)

            if (query.get('type') === 'HISTORY') {

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
            }

            this.props.tabsUpdate({
                id: activeTab.get('id'),
                data: {
                    queryId: query.get('id'),
                    loading: false
                }
            })

            this.props.projectsAttachHistoryQuery({
                projectId: this.props.project.get('id'),
                queryId: query.get('id')
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
                    queryId: query.get('id')
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
            console.log('query', query.toJSON())

            const queryFacts = getQueryFacts(this.getSchema(), query.get('query'))

            console.log('queryFacts', queryFacts)

            console.log({
                operationName: getOperationName(queryFacts),
                operationType: getOperationType(queryFacts),
            })

            this.props.queriesUpdate({
                id: query.get('id'),
                data: {
                    operationName: getOperationName(queryFacts),
                    operationType: getOperationType(queryFacts),
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

            const data = {
                queryId: query.get('id')
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
    }

    return connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(ProjectDetail)
}