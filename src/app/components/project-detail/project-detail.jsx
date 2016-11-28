import React from 'react'
import electron from "electron"
import moment from "moment"
import uuid from "uuid"
import {introspectionQuery, buildClientSchema, print, parse} from 'graphql'
import {Map, List} from "immutable"
import VariableEditorController from "./variable-editor-controller"
import HeaderEditorController from "./header-editor-controller"
import reduce from "lodash/reduce"
import forEach from "lodash/forEach"
import get from "lodash/get"
import createModal from "app/utils/create-modal"
import querystring from "querystring"
import omitBy from "lodash/omitBy"
import isNil from "lodash/isNil"
import isEmpty from "lodash/isEmpty"
import merge from "lodash/merge"
import {DocExplorer} from 'graphiql/dist/components/DocExplorer';
import {connect} from "react-redux"
import {bindActionCreators} from "redux"

const DEFAULT_GET_HEADERS = {}

const DEFAULT_POST_HEADERS = {
    'content-type': 'application/json'
}

const NEW_QUERY = Map({
    method: 'POST',
    query: '',
    operationName: '',
    variables: '',
    headers: List()
})

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

export default (actions, selectors, history, Loader, Layout, WorkspaceHeader, MenuItem, VariableEditor, HeaderEditor, QueryList, Tabs, GraphiQL, ProjectFormModal) => {

    ProjectFormModal = createModal(ProjectFormModal)

    const mapStateToProps = (state, props) => ({
        project: selectors.findProject(state, {projectId: props.params.id})
    })

    const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

    class ProjectDetail extends React.Component {

        constructor(props) {
            super(props)
            this.variableEditorController = VariableEditorController(this)
            this.headerEditorController = HeaderEditorController(this)
        }

        componentDidMount() {
            if (this.props.project) {
                this.ensureData(this.props)
            }
        }

        componentDidUpdate(prevProps) {

            if (!prevProps.project && this.props.project || prevProps.project && this.props.project && prevProps.project.get('id') !== this.props.project.get('id')) {
                this.ensureData()
            }
        }

        ensureData() {

            const promises = this.props.project
                .get('environments')
                .filter(env => !env.get('schema'))
                .map(env => {

                    return this.fetchQuery({
                        url: env.get('url'),
                        method: 'POST',
                        params: {
                            query: introspectionQuery
                        }
                    }).then(response => {
                        this.updateEnvironment(env.get('id'), env => {
                            return env
                                .setIn(['schema', 'updatedAt'], moment().utc().toISOString())
                                .setIn(['schema', 'response'], JSON.stringify(response, null, 2))
                        })
                    })
                })

            Promise.all(promises)
        }

        fetchSchema(environment) {

            return this.fetchQuery({
                url: environment.url,
                method: 'POST',
                headers: {},
                params: {
                    query: introspectionQuery
                }
            }).then(response => {

                this.setState({
                    schemas: this.state.schemas.set(environment.id, buildClientSchema(response.data))
                })
            }).catch(e => {

                let errors = get(e, 'response.data.errors')

                errors = errors ? errors.map(error => `• ${error.message}\n`) : null

                electron.remote.dialog.showErrorBox(`Exception - ${e.toString()}`, `Unable to fetch schema for '${environment.url}'\n\n ${errors}`)
            })
        }

        render() {

            if (!this.props.project) {

                return (
                    <Loader
                        message="Loading project details"
                    />
                )
            }

            const environment = this.props.project.get('selectedEnvironment')

            const projectId = this.props.project.get('id')
            const leftPaneState = this.props.project.getIn(['settings', 'leftPane', 'state'])

            const buttonsLeft = [{
                description: 'Back',
                onClick: () => history.push('/project-list')
            }, {
                description: 'Collection',
                active: leftPaneState === 'COLLECTION',
                onClick: () => {
                    this.props.updateProject({
                        id: projectId,
                        data: this.props.project.get('source').setIn(['settings', 'leftPane', 'state'], leftPaneState === 'COLLECTION' ? null : 'COLLECTION')
                    })
                }
            }, {
                description: 'History',
                active: leftPaneState === 'HISTORY',
                onClick: () => {
                    this.props.updateProject({
                        id: projectId,
                        data: this.props.project.get('source').setIn(['settings', 'leftPane', 'state'], leftPaneState === 'HISTORY' ? null : 'HISTORY')
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

            const topPaneState = this.props.project.getIn(['settings', 'topPane', 'state'])
            const rightPaneState = this.props.project.getIn(['settings', 'rightPane', 'state'])

            const buttonsRight = [{
                description: 'Settings',
                onClick: this.handleProjectEdit
            }, {
                description: 'Variables',
                active: topPaneState === 'VARIABLES',
                onClick: () => {
                    this.props.updateProject({
                        id: projectId,
                        data: this.props.project.get('source').setIn(['settings', 'topPane', 'state'], topPaneState === 'VARIABLES' ? null : 'VARIABLES')
                    })
                }
            }, {
                description: 'Headers',
                active: topPaneState === 'HEADERS',
                onClick: () => {
                    this.props.updateProject({
                        id: projectId,
                        data: this.props.project.get('source').setIn(['settings', 'topPane', 'state'], topPaneState === 'HEADERS' ? null : 'HEADERS')
                    })
                }
            }, {
                description: 'Docs',
                active: rightPaneState === 'DOCS',
                onClick: () => {
                    this.props.updateProject({
                        id: projectId,
                        data: this.props.project.get('source').setIn(['settings', 'rightPane', 'state'], rightPaneState === 'DOCS' ? null : 'DOCS')
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
                disabled: !this.props.project.get('selectedTab'),
                onClick: () => this.runQuery()
            }, {
                description: 'Prettify',
                disabled: !this.props.project.get('selectedTab'),
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

            switch (leftPaneState) {
                case 'COLLECTION':
                    queries = this.props.project.get('collectionQueries')
                    break
                case 'HISTORY':
                    queries = this.props.project.get('historyQueries')
                    break
            }

            const selectedTab = this.props.project.get('selectedTab')

            let schema = null

            if (environment.hasIn(['schema', 'response'])) {
                const schemaResponse = JSON.parse(environment.getIn(['schema', 'response']))
                schema = buildClientSchema(schemaResponse.data)
            }

            console.log({
                schema
            })

            const HEADER_HEIGHT = 40
            const TABS_HEIGHT = 34
            const PANEL_HEIGHT = topPaneState !== null ? 200 : 0
            const DRAWER_WIDTH = leftPaneState !== null ? 350 : 0
            const DOC_EXPLORER_PANE_WIDTH = rightPaneState !== null ? 350 : 0

            return (
                <Layout>
                    {({width, height}) => (
                        <div className="ProjectDetail">
                            <WorkspaceHeader
                                width={width}
                                height={HEADER_HEIGHT}
                                left={headerLeft}
                                center={this.props.project.get('selectedTab') ? headerCenter : null}
                                right={headerRight}
                            />
                            {topPaneState === 'HEADERS' ? (
                                <HeaderEditor
                                    top={HEADER_HEIGHT}
                                    width={width}
                                    height={PANEL_HEIGHT}
                                    headers={this.headerEditorController.getHeaders()}
                                    onHeaderAddClick={this.headerEditorController.handleAddClick}
                                    onHeaderClearClick={this.headerEditorController.handleClear}
                                    onHeaderChange={this.headerEditorController.handleChange}
                                    onHeaderRemove={this.headerEditorController.handleRemove}
                                />
                            ) : null}
                            {topPaneState === 'VARIABLES' ? (
                                <VariableEditor
                                    top={HEADER_HEIGHT}
                                    width={width}
                                    height={PANEL_HEIGHT}
                                    variables={this.variableEditorController.getVariables()}
                                    onChange={this.variableEditorController.handleChange}
                                />
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
                                    activeId={this.props.project.get('selectedTabId')}
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
                                {leftPaneState !== null ? (
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
                                            activeId={selectedTab && selectedTab.getIn(['request', 'id'])}
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
                                        {selectedTab ? (
                                            <GraphiQL
                                                ref={ref => this.graphiql = ref}
                                                schema={schema}
                                                onEditQuery={this.handleEditQuery}
                                                onEditVariables={this.handleEditVariables}
                                                onEditOperationName={this.handleEditOperationName}
                                                onRunQuery={this.handleEditorRunQuery}
                                                query={selectedTab.getIn(['request', 'query'])}
                                                operationName={selectedTab.getIn(['request', 'operationName'])}
                                                response={selectedTab.getIn(['request', 'response'])}
                                                variables={selectedTab.getIn(['request', 'variables'])}
                                                isWaitingForResponse={selectedTab.getIn(['request', 'loading'])}
                                            />
                                        ) : (
                                            <div>
                                                Empty
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {
                                    rightPaneState === 'DOCS' &&
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
                                <ProjectFormModal
                                    ref={ref => this.projectFormModal = ref}
                                    title="Edit Project"
                                />
                            </div>
                        </div>
                    )}
                </Layout>
            )
        }

        handlePrettifyQuery = () => {

            const selectedTab = this.props.project.get('selectedTab')

            if (selectedTab) {
                const query = selectedTab.getIn(['request', 'query'])

                this.updateSelectedTab(tab => {
                    return tab.setIn(['request', 'query'], print(parse(query)))
                })
            }
        }

        handleEditorRunQuery = () => {
            this.runQuery()
        }

        runQuery = async() => {

            const environment = this.props.project.get('selectedEnvironment')
            const tab = this.props.project.get('selectedTab')

            const startTime = moment()

            this.props.projectUpdateTab({
                projectId: this.props.project.get('id'),
                tabId: tab.get('id'),
                updateFn: tab => {
                    return tab
                        .setIn(['request', 'loading'], true)
                }
            })

            const response = await this.fetchQuery({
                url: environment.get('url'),
                method: this.props.project.getIn(['settings', 'queryMethod']),
                headers: applyVariablesToHeaders(this.props.project),
                params: {
                    query: tab.getIn(['request', 'query']),
                    operationName: tab.get(['request', 'operationName']),
                    variables: tab.get(['request', 'variables'])
                }
            })

            // const query = Map({
            //     title: this.state.operationName,
            //     type: 'HISTORY',
            //     duration: +moment() - +startTime,
            //     environmentId: environment.id,
            //     operationType: null
            // })

            this.props.projectUpdateTab({
                projectId: this.props.project.get('id'),
                tabId: tab.get('id'),
                updateFn: tab => {
                    return tab
                        .setIn(['request', 'loading'], false)
                        .setIn(['request', 'response'], JSON.stringify(response, null, 2))
                }
            })
        }

        handleTabAdd = () => {
            this.props.projectAddTab({
                projectId: this.props.project.get('id')
            })
        }

        handleTabClick = ({id}) => {

            this.props.updateProject({
                id: this.props.project.get('id'),
                data: this.props.project.get('source').set('selectedTabId', id)
            })
        }

        handleTabRemove = ({id}) => {

            this.props.updateProject({
                id: this.props.project.get('id'),
                data: this.props.project.get('source').update('tabs', tabs => {
                    return tabs.filter(tab => tab.get('id') !== id)
                })
            })
        }

        handleProjectEdit = async() => {

            const result = await this.projectFormModal.open({
                project: this.props.project
            })

            if (result.status === 'SAVE') {

                const projectId = this.props.project.get('id')

                this.props.updateProject({
                    id: projectId,
                    data: result.payload.input
                })
            }
        }

        renderMethodsSelect() {

            const method = this.props.project.getIn(['settings', 'queryMethod'])

            return (
                <select ref="method" name="method" className="Select form-control" value={method}
                        onChange={this.handleMethodChange}>
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                </select>
            )
        }

        renderEnvironmentSelect() {

            return (
                <select ref="environment" name="environment" className="Select form-control"
                        value={this.props.project.get('selectedEnvironment')}
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

            const method = this.refs.method.value

            this.props.updateProject({
                id: this.props.project.get('id'),
                data: this.props.project.get('source').setIn(['settings', 'queryMethod'], method)
            })
        }

        handleEnvironmentChange = () => {

            const id = this.refs.environment.value

            const projectId = this.props.project.get('id')

            this.props.updateProject({
                id: projectId,
                data: this.props.project.get('source').set('environmentId', id)
            })
        }

        handleOperationNameChange = () => {

        }

        updateEnvironment = (id, updateFn) => {
            this.props.updateProject({
                id: this.props.project.get('id'),
                data: this.props.project.get('source').update('environments', envs => {
                    return envs.map(env => {
                        if (env.get('id') === id) {
                            return updateFn(env)
                        }
                        return env
                    })
                })
            })
        }

        updateSelectedTab = (updateFn) => {

            this.props.projectUpdateTab({
                projectId: this.props.project.get('id'),
                tabId: this.props.project.get('selectedTabId'),
                updateFn
            })
        }

        handleEditQuery = (query) => {
            this.updateSelectedTab(tab => {
                return tab.setIn(['request', 'query'], query)
            })
        }

        handleEditVariables = (variables) => {
            this.updateSelectedTab(tab => {
                return tab.setIn(['request', 'variables'], variables)
            })
        }

        handleEditOperationName = (operationName) => {
            this.updateSelectedTab(tab => {
                return tab.set(['request', 'operationName'], operationName)
            })
        }

        fetchQuery = ({url, method, headers, params}) => {

            console.log('params', params)

            params = omitBy(params, isNil)
            params = omitBy(params, isEmpty)

            let options = {
                method,
                credentials: 'include'
            }

            if (method == "GET") {

                options.headers = merge(DEFAULT_GET_HEADERS, headers)

                url += url.indexOf('?') == -1 ? "?" : "&"

                url += querystring.stringify(params)
            }

            else {

                options.headers = merge(DEFAULT_POST_HEADERS, headers)

                options.body = JSON.stringify(params)
            }

            console.log({
                url,
                method,
                headers,
                params
            })

            return fetch(url, options).then(res => res.json())
        }

        handleQueryClick = ({id}) => {

            queries.findQuery({queryId: id}).then(query => {

                query = readQuery({query})

                this.setState({
                    query,
                    operationName: query.get('title')
                })
            })
        }

        handleQueryRemove = ({id}) => {

            mutations.removeQuery({queryId: id}).then(() => {
                this.fetchQueries({projectId: this.props.project._id})
            })
        }
    }

    return connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(ProjectDetail)
}