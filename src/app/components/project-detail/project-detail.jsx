import React from 'react'
import electron from "electron"
import moment from "moment"
import {introspectionQuery, buildClientSchema, print, parse} from 'graphql'
import {List} from "immutable"
import get from "lodash/get"
import querystring from "querystring"
import omitBy from "lodash/omitBy"
import isNil from "lodash/isNil"
import isEmpty from "lodash/isEmpty"
import merge from "lodash/merge"
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

export default (actions, selectors, factories, history, Loader, Layout, WorkspaceHeader, MenuItem, VariableEditor, HeaderEditor, QueryList, Tabs, GraphiQL, ProjectEditModal) => {

    const mapStateToProps = (state, props) => ({
        project: selectors.findProject(state, {id: props.params.id})
    })

    const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

    class ProjectDetail extends React.Component {

        fetchSchema(environment) {

            return this.fetchQuery({
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

            const topPanel = this.props.project.get('topPanel')
            const rightPanel = this.props.project.get('rightPanel')

            const buttonsRight = [{
                description: 'Settings',
                onClick: this.handleProjectEdit
            }, {
                description: 'Variables',
                active: topPanel === 'VARIABLES',
                onClick: () => {
                    this.props.projectsUpdate({
                        id: projectId,
                        data: {
                            topPanel: topPanel === 'VARIABLES' ? null : 'VARIABLES'
                        }
                    })
                }
            }, {
                description: 'Headers',
                active: topPanel === 'HEADERS',
                onClick: () => {
                    this.props.projectsUpdate({
                        id: projectId,
                        data: {
                            topPanel: topPanel === 'HEADERS' ? null : 'HEADERS'
                        }
                    })
                }
            }, {
                description: 'Docs',
                active: rightPanel === 'DOCUMENTATION',
                onClick: () => {
                    this.props.projectsUpdate({
                        id: projectId,
                        data: {
                            rightPanel: rightPanel === 'DOCUMENTATION' ? null : 'DOCUMENTATION'
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
                        {this.renderMethodsSelect()}
                    </div>
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

            // let schema = null
            //
            // let schemaResponse = environment.get('schema')
            //
            // if (schemaResponse) {
            //     schema = buildClientSchema(JSON.parse(schemaResponse))
            // }

            const HEADER_HEIGHT = 40
            const TABS_HEIGHT = 34
            const PANEL_HEIGHT = topPanel !== null ? 200 : 0
            const DRAWER_WIDTH = leftPanel !== null ? 350 : 0
            const DOC_EXPLORER_PANE_WIDTH = rightPanel !== null ? 350 : 0

            return (
                <Layout>
                    {({width, height}) => (
                        <div className="ProjectDetail">
                            <WorkspaceHeader
                                width={width}
                                height={HEADER_HEIGHT}
                                left={headerLeft}
                                center={this.props.project.get('activeTab') ? headerCenter : null}
                                right={headerRight}
                            />
                            {topPanel === 'HEADERS' ? (
                                <VariableEditor
                                    top={HEADER_HEIGHT}
                                    width={width}
                                    height={PANEL_HEIGHT}
                                    value={this.props.project.get('headers')}
                                    onChange={this.handleHeadersChange}
                                />
                            ) : null}
                            {topPanel === 'VARIABLES' ? (
                                activeEnvironment ? (
                                    <VariableEditor
                                        top={HEADER_HEIGHT}
                                        width={width}
                                        height={PANEL_HEIGHT}
                                        value={activeEnvironment.get('variables')}
                                        onChange={this.handleVariablesChange}
                                    />
                                ) : (
                                    <div>
                                        No environment selected
                                    </div>
                                )
                            ) : null}
                            <div
                                className="Tabs__Holder"
                                style={{
                                    position: 'absolute',
                                    top: HEADER_HEIGHT + PANEL_HEIGHT,
                                    width: width,
                                    height: TABS_HEIGHT
                                }}
                            >
                                <Tabs
                                    width={width}
                                    height={TABS_HEIGHT}
                                    activeId={this.props.project.get('activeTabId')}
                                    tabs={this.props.project.get('tabs')}
                                    onClick={this.handleTabClick}
                                    onRemove={this.handleTabRemove}
                                    onAdd={this.handleTabAdd}
                                />
                            </div>
                            <div className="ProjectDetailContent"
                                 style={{
                                     top: HEADER_HEIGHT + PANEL_HEIGHT + TABS_HEIGHT,
                                     height: height - HEADER_HEIGHT - PANEL_HEIGHT - TABS_HEIGHT
                                 }}
                            >
                                {leftPanel !== null ? (
                                    <div
                                        className="ProjectDetail__Drawer"
                                        style={{
                                            width: DRAWER_WIDTH,
                                            height: height - HEADER_HEIGHT - PANEL_HEIGHT - TABS_HEIGHT
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
                                    className="ProjectDetail__GraphiQL"
                                    style={{
                                        left: DRAWER_WIDTH,
                                        width: width - DRAWER_WIDTH - DOC_EXPLORER_PANE_WIDTH,
                                        height: height - HEADER_HEIGHT - PANEL_HEIGHT - TABS_HEIGHT
                                    }}
                                >
                                    <div
                                        className="GraphiQL__Holder"
                                        style={{
                                            width: width - DRAWER_WIDTH - DOC_EXPLORER_PANE_WIDTH,
                                            height: height - HEADER_HEIGHT - PANEL_HEIGHT - TABS_HEIGHT
                                        }}
                                    >
                                        {activeEnvironment && activeTab ? (
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
                                {
                                    (activeEnvironment && rightPanel === 'DOCUMENTATION') &&
                                    <div className="DocExplorerPane" style={{
                                        width: DOC_EXPLORER_PANE_WIDTH,
                                        height: height - HEADER_HEIGHT - PANEL_HEIGHT - TABS_HEIGHT
                                    }}>
                                        <div
                                            className="docExplorerWrap"
                                            style={{
                                                width: DOC_EXPLORER_PANE_WIDTH
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
                                }
                            </div>
                            <div className="overlay">
                                <ProjectEditModal
                                    ref={ref => this.projectEditModal = ref}
                                />
                            </div>
                        </div>
                    )}
                </Layout>
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

            const response = await this.fetchQuery({
                url: activeEnvironment.get('url'),
                method: this.props.project.getIn(['settings', 'queryMethod']),
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

        renderMethodsSelect() {

            const queryMethod = this.props.project.getIn(['activeEnvironment', 'method'])

            return (
                <select ref="method" name="method" className="Select form-control" value={queryMethod}
                        onChange={this.handleMethodChange}>
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                </select>
            )
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

        handleMethodChange = () => {

            const queryMethod = this.refs.method.value

            this.props.environmentsUpdate({
                id: this.props.project.get('activeEnvironmentId'),
                data: {
                    queryMethod
                }
            })
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

        fetchQuery = ({url, method, headers, params}) => {

            params = omitBy(params, isNil)
            params = omitBy(params, isEmpty)

            let options = {
                method,
                credentials: 'include'
            }

            if (method == "GET") {

                options.headers = merge({}, headers)

                url += url.indexOf('?') == -1 ? "?" : "&"

                url += querystring.stringify(params)
            }

            else {

                options.headers = merge({
                    'content-type': 'application/json'
                }, headers)

                options.body = JSON.stringify(params)
            }

            return fetch(url, options).then(res => res.json())
        }

        handleQueryClick = ({id}) => {

        }

        handleQueryRemove = ({id}) => {

        }

        handleProjectEdit = () => {
            this.projectEditModal.open({
                id: this.props.project.get('id')
            })
        }

        handleHeadersChange = ({value}) => {

            this.props.projectsUpdate({
                id: this.props.project.get('id'),
                data: {
                    headers: value
                }
            })
        }

        handleVariablesChange = ({value}) => {

            this.props.environmentsUpdate({
                id: this.props.project.get('activeEnvironmentId'),
                data: {
                    variables: value
                }
            })
        }
    }

    return connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(ProjectDetail)
}