import React from 'react'
import moment from "moment"
import {print, parse} from 'graphql'
import {fromJS, Map, List} from "immutable"
import VariableEditorController from "./variable-editor-controller"
import HeaderEditorController from "./header-editor-controller"
import createModal from "app/utils/create-modal"
import querystring from "querystring"
import omitBy from "lodash/omitBy"
import isNil from "lodash/isNil"
import isEmpty from "lodash/isEmpty"
import merge from "lodash/merge"
import {DocExplorer} from 'graphiql/dist/components/DocExplorer';
import {connect} from "react-redux"
import {bindActionCreators} from "redux"
import uuid from "uuid"
import getOperationType from "app/utils/get-operation-type"
import getQueryFacts from 'graphiql/dist/utility/getQueryFacts';
import debounce from 'graphiql/dist/utility/debounce';
import get from "lodash/get"

const DEFAULT_GET_HEADERS = {}

const DEFAULT_POST_HEADERS = {
    'content-type': 'application/json'
}

function createHeaders(headers, variables) {

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

export default (queries, mutations, selectors, history, view, Layout, WorkspaceHeader, MenuItem, VariableEditor, HeaderEditor, QueryList, Tabs, GraphiQL, ProjectFormModal) => {

    ProjectFormModal = createModal(ProjectFormModal)

    const mapQueriesToProps = (props) => ({
        project: queries.findProject({id: props.params.id})
    })

    class ProjectDetail extends React.Component {

        constructor(props) {
            super(props)
            this.variableEditorController = VariableEditorController(this)
            this.headerEditorController = HeaderEditorController(this)
        }

        render() {

            const projectId = this.props.project.get('id')
            const selectedTab = this.props.project.get('selectedTab')

            const buttonsLeft = [{
                description: 'Back',
                onClick: () => history.push('/project-list')
            }, {
                description: 'Collection',
                active: this.props.project.get('leftPane') === 'COLLECTION',
                onClick: () => {
                    this.props.updateProject({
                        id: projectId,
                        data: {
                            id: projectId,
                            leftPane: this.props.project.get('leftPane') === 'COLLECTION' ? null : 'COLLECTION'
                        }
                    })
                }
            }, {
                description: 'History',
                active: this.props.project.get('leftPane') === 'HISTORY',
                onClick: () => {
                    this.props.updateProject({
                        data: {
                            id: projectId,
                            leftPane: this.props.project.get('leftPane') === 'HISTORY' ? null : 'HISTORY'
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

            const buttonsRight = [{
                description: 'Settings',
                onClick: this.handleProjectEdit
            }, {
                description: 'Variables',
                active: this.props.project.get('topPane') === 'VARIABLES',
                onClick: () => {
                    this.props.updateProject({
                        data: {
                            id: projectId,
                            topPane: this.props.project.get('topPane') === 'VARIABLES' ? null : 'VARIABLES'
                        }
                    })
                }
            }, {
                description: 'Headers',
                active: this.props.project.get('topPane') === 'HEADERS',
                onClick: () => {
                    this.props.updateProject({
                        data: {
                            id: projectId,
                            topPane: this.props.project.get('topPane') === 'HEADERS' ? null : 'HEADERS'
                        }
                    })
                }
            }, {
                description: 'Docs',
                active: this.props.project.get('rightPane') === 'DOCS',
                onClick: () => {
                    this.props.updateProject({
                        id: projectId,
                        rightPane: this.props.project.get('rightPane') === 'DOCS' ? null : 'DOCS'
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
                disabled: !selectedTab,
                onClick: () => this.runQuery()
            }, {
                description: 'Prettify',
                disabled: !selectedTab,
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

            const HEADER_HEIGHT = 40
            const TABS_HEIGHT = 34
            const PANEL_HEIGHT = this.props.project.get('topPane') !== null ? 200 : 0
            const DRAWER_WIDTH = this.props.project.get('leftPane') !== null ? 350 : 0
            const DOC_EXPLORER_PANE_WIDTH = this.props.project.get('rightPane') !== null ? 350 : 0

            return (
                <Layout>
                    {({width, height}) => (
                        <div className="ProjectDetail">
                            <WorkspaceHeader
                                width={width}
                                height={HEADER_HEIGHT}
                                left={headerLeft}
                                center={selectedTab ? headerCenter : null}
                                right={headerRight}
                            />
                            {this.props.project.get('topPane') === 'HEADERS' ? (
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
                            {this.props.project.get('topPane') === 'VARIABLES' ? (
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
                                    activeId={this.props.project.getIn(['selectedTab', 'id'])}
                                    tabs={this.props.project.get('queryTabs').map(tab => {
                                        const title = tab.getIn(['query', 'operationName'])
                                        return tab.set('title', title || "<Unnamed>")
                                    })}
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
                                {this.props.project.get('leftPane') !== null ? (
                                    <div
                                        className="ProjectDetail__Drawer"
                                        style={{
                                            width: DRAWER_WIDTH,
                                            height: height - HEADER_HEIGHT - PANEL_HEIGHT - TABS_HEIGHT
                                        }}
                                    >
                                        <QueryList
                                            data={this.props.project.get('historyQueries')}
                                            rowHeight={72}
                                            activeId={selectedTab && selectedTab.get('queryId')}
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
                                                schema={this.props.schema}
                                                onEditQuery={this.handleEditQuery}
                                                onEditVariables={this.handleEditVariables}
                                                onRunQuery={this.handleEditorRunQuery}
                                                query={selectedTab.getIn(['query', 'query'])}
                                                operationName={selectedTab.getIn(['query', 'operationName'])}
                                                response={selectedTab.getIn(['query', 'response'])}
                                                variables={selectedTab.getIn(['query', 'variables'])}
                                                isWaitingForResponse={selectedTab.get('loading')}
                                            />
                                        ) : (
                                            <div>
                                                Empty
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {
                                    this.props.project.get('rightPane') === 'DOCS' &&
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
                                                schema={this.props.schema}
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

            if (this.props.project.get('selectedTab')) {
                const query = this.props.project.getIn(['selectedTab', 'query', 'query'])

                const tabId = this.props.project.getIn(['selectedTab', 'id'])

                this.props.updateQueryTab({
                    id: tabId,
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

            const requestId = uuid.v4()
            const environment = this.props.project.get('selectedEnvironment')

            const startTime = moment()

            this.props.projectUpdateTab({
                projectId: this.props.project.get('id'),
                id: this.props.project.getIn(['selectedTab', 'id']),
                data: {
                    loading: true
                }
            })

            const query = this.props.project.getIn(['selectedTab', 'query', 'query'])
            const headers = this.props.project.get('headers')
            const variables = environment.get('variables')

            const fullResponse = await this.fetchQuery({
                url: environment.get('url'),
                method: this.props.project.get('queryMethod'),
                headers: createHeaders(headers, variables),
                params: {
                    query,
                    operationName: this.props.project.getIn(['selectedTab', 'query', 'operationName']),
                    variables: this.props.project.getIn(['selectedTab', 'query', 'variables'])
                }
            })

            const response = JSON.stringify(fullResponse, null, 2)
            const duration = +moment() - +startTime

            const historyQuery = await this.props.createHistoryQuery({
                data: {
                    operationType: getOperationType(this.props.schema, query),
                    operationName: this.props.project.getIn(['selectedTab', 'query', 'operationName']),
                    variables: this.props.project.getIn(['selectedTab', 'query', 'variables']),
                    duration,
                    response
                }
            })

            return await this.props.updateQueryTab({
                id: this.props.project.getIn(['selectedTab', 'id']),
                data: {
                    queryId: historyQuery.get('id'),
                    loading: false
                }
            })
        }

        handleTabAdd = async() => {

            await this.props.createQueryTab({
                input: {
                    type: 'NEW',
                    projectId: this.props.project.get('id')
                }
            })

            await this.props.reload()
        }

        handleTabClick = ({id}) => {

            this.props.updateProject({
                data: {
                    id: this.props.project.get('id'),
                    selectedTabId: id
                }
            })
        }

        handleTabRemove = ({id}) => {

            this.props.removeQueryTab({
                data: {
                    id: id
                }
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
                        value={this.props.project.getIn(['selectedEnvironment', 'id'])}
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
                data: this.props.project.get('source').set('selectedEnvironmentId', id)
            })
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
            if (this.props.schema) {
                this._updateQueryFacts()
            }
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

            console.log('operationName', operationName)
            this.updateSelectedTab(tab => {
                return tab.setIn(['request', 'operationName'], operationName)
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

                options.headers = merge(DEFAULT_GET_HEADERS, headers)

                url += url.indexOf('?') == -1 ? "?" : "&"

                url += querystring.stringify(params)
            }

            else {

                options.headers = merge(DEFAULT_POST_HEADERS, headers)

                options.body = JSON.stringify(params)
            }

            return fetch(url, options).then(res => res.json())
        }

        handleQueryClick = ({id}) => {

            const request = this.props.requests.find(request => request.get('id') === id)

            if (!request) {
                return
            }

            console.log('request', request.toJSON())

            this.updateSelectedTab(tab => {
                return tab
                    .setIn(['request', 'id'], request.get('id'))
                    .setIn(['request', 'operationName'], request.get('operationName'))
                    .setIn(['request', 'variables'], request.get('variables'))
                    .setIn(['request', 'query'], request.get('query'))
                    .setIn(['request', 'response'], request.get('response'))
            })
        }

        handleQueryRemove = ({id}) => {

            if (this.props.leftPaneState === 'HISTORY') {
                this.props.projectRemoveHistoryRequest({
                    projectId: this.props.project.get('id'),
                    id
                })
            }
        }

        _updateQueryFacts = debounce(50, () => {

            let operationName = null

            if (this.props.schema) {

                const queryFacts = getQueryFacts(this.props.schema, this.props.selectedTab.getIn(['request', 'query']));

                if (queryFacts && queryFacts.operations) {
                    operationName = get(queryFacts, 'operations[0].name.value')
                }
            }

            console.log('operationName', operationName)

            this.updateSelectedTab(tab => {
                return tab.setIn(['request', 'operationName'], operationName)
            })
        })
    }

    return view(mapQueriesToProps, mutations)(ProjectDetail)
}