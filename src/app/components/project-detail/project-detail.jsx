import React from 'react'
import electron from "electron"
import moment from "moment"
import {introspectionQuery, buildClientSchema, print, parse} from 'graphql'
import {Map, List} from "immutable"
import get from "lodash/get"
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

export default ({actionCreators, selectors, factories, history, WorkspaceHeader, MenuItem, QueryList, Tabs, GraphiQL, ProjectPanel, EnvironmentPanel}) => {

    const mapStateToProps = (state, props) => {

        const project = selectors.findProject(state, {id: props.params.id})
        const tabs = project.get('tabs').map(tab => Map({
            id: tab.get('id'),
            title: tab.get('operationName') || "<Unnamed>"
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
            environmentEditId: null
        }

        componentDidMount() {
            window.addEventListener('resize', this.handleWindowResize)
            this.handleWindowResize()
        }

        fetchSchema(environment) {

            return queries.fetchQuery({
                url: environment.get('url'),
                method: 'POST',
                headers: {},
                params: {
                    query: introspectionQuery
                }
            }).then(response => {

                this.props.environmentsUpdate({
                    id: environment.get('id'),
                    data: {
                        schema: response.data
                    }
                })

            }).catch(e => {

                let errors = get(e, 'response.data.errors')

                errors = errors ? errors.map(error => `• ${error.message}\n`) : null

                electron.remote.dialog.showErrorBox(`Exception - ${e.toString()}`, `Unable to fetch schema for '${environment.url}'\n\n ${errors}`)
            })
        }

        render() {

            console.log('this.props', this.props)

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

                        this.setState({
                            environmentEditId: activeEnvironment.get('id')
                        }, () => {
                            this.props.projectsUpdate({
                                id: projectId,
                                data: {
                                    rightPanel: rightPanel === 'ENVIRONMENT' ? null : 'ENVIRONMENT'
                                }
                            })
                        })
                    }
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

            const buttonsCenter = [{
                description: 'Run',
                disabled: !this.props.project.get('activeTab'),
                onClick: () => this.runQuery()
            }, {
                description: 'Prettify',
                disabled: !this.props.project.get('activeTab'),
                onClick: () => this.handlePrettifyQuery()
            }]

            const headerCenter = (
                <div className="Menu Menu--horizontal">
                    <div className="MenuItem">
                        {this.renderEnvironmentSelect()}
                    </div>
                    {buttonsCenter.map((item, key) => (
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

            let queries = List()

            switch (leftPanel) {
                case 'COLLECTION':
                    queries = this.props.project.get('collectionQueries')
                    break
                case 'HISTORY':
                    queries = this.props.project.get('historyQueries')
                    break
            }

            const activeTab = this.props.project.get('activeTab')

            let schema = null

            if (activeEnvironment) {

                let schemaResponse = activeEnvironment.get('schemaResponse')

                if (schemaResponse) {
                    schema = buildClientSchema(JSON.parse(schemaResponse))
                }
            }

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
                        center={this.props.project.get('activeTab') ? headerCenter : null}
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
                                    data={queries}
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
                                        query={activeTab.get('query')}
                                        operationName={activeTab.get('operationName')}
                                        response={activeTab.get('response')}
                                        variables={activeTab.get('variables')}
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
                                        project={this.props.project}
                                        onUpdate={this.handleProjectUpdate}
                                        onEnvironmentAdd={this.handleEnvironmentAdd}
                                        onEnvironmentEdit={this.handleEnvironmentEdit}
                                        onEnvironmentRemove={this.handleEnvironmentRemove}
                                    />
                                )}
                                {rightPanel === 'ENVIRONMENT' && this.state.environmentEditId && (
                                    <EnvironmentPanel
                                        width={RIGHT_PANEL_WIDTH}
                                        height={RIGHT_PANEL_HEIGHT}
                                        environmentId={this.state.environmentEditId}
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
                    query: activeTab.get('query'),
                    operationName: activeTab.get('operationName'),
                    variables: activeTab.get('variables')
                }
            })

            // const query = Map({
            //     title: this.state.operationName,
            //     type: 'HISTORY',
            //     duration: +moment() - +startTime,
            //     environmentId: environment.id,
            //     operationType: null
            // })

            this.props.tabsUpdate({
                id: activeTab.get('id'),
                data: {
                    loading: false,
                    response: JSON.stringify(response, null, 2)
                }
            })
        }

        handleTabAdd = () => {

            const tab = factories.createTab()

            this.props.tabsCreate({
                id: tab.get('id'),
                data: tab
            })

            this.props.projectsAttachTab({
                projectId: this.props.project.get('id'),
                tabId: tab.get('id')
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

            this.props.projectsDetachTab({
                projectId: this.props.project.get('id'),
                tabId: id
            })

            this.props.tabsRemove({
                id
            })
        }

        renderEnvironmentSelect() {

            return (
                <select ref="environment" name="environment" className="Select form-control"
                        value={this.props.project.get('activeEnvironment')}
                        onChange={this.handleEnvironmentChange}>
                    {this.props.project.get('environments').map(environment => (
                        <option
                            key={environment.get('id')}
                            value={environment.get('id')}
                        >
                            {environment.get('title')} - {environment.get('url')}
                        </option>
                    )).toArray()}
                </select>
            )
        }

        handleEnvironmentChange = () => {

            const activeEnvironmentId = this.refs.environment.value

            this.props.projectsUpdate({
                id: this.props.project.get('id'),
                data: {
                    activeEnvironmentId
                }
            })
        }

        handleEditQuery = (query) => {

            this.props.tabsUpdate({
                id: this.props.project.get('activeTabId'),
                data: {
                    query
                }
            })
        }

        handleEditVariables = (variables) => {

            this.props.tabsUpdate({
                id: this.props.project.get('activeTabId'),
                data: {
                    variables
                }
            })
        }

        handleEditOperationName = (operationName) => {

            this.props.tabsUpdate({
                id: this.props.project.get('activeTabId'),
                data: {
                    operationName
                }
            })
        }

        handleQueryClick = ({id}) => {

        }

        handleQueryRemove = ({id}) => {

        }

        handleWindowResize = () => {
            this.setState({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }

        handleProjectUpdate = ({project}) => {

            this.props.projectsUpdate({
                id: project.get('id'),
                data: project.merge({
                    rightPanel: null
                })
            })
        }

        handleEnvironmentAdd = ({environment}) => {

            this.props.environmentsCreate({
                id: environment.get('id'),
                data: environment
            })

            this.props.projectsAttachEnvironment({
                projectId: this.props.project.get('id'),
                environmentId: environment.get('id')
            })
        }

        handleEnvironmentEdit = ({id}) => {

            this.setState({
                environmentEditId: id
            }, () => {

                this.props.projectsUpdate({
                    id: this.props.project.get('id'),
                    data: {
                        rightPanel: 'ENVIRONMENT'
                    }
                })
            })
        }

        handleEnvironmentRemove = ({id}) => {

            this.props.projectsDetachEnvironment({
                projectId: this.props.project.get('id'),
                environmentId: id
            })

            this.props.environmentsRemove({
                id: id
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