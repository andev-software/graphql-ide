import React from "react"
import {Alert, Modal, FormGroup, FormControl, ControlLabel} from "react-bootstrap"
import {bindActionCreators} from "redux"
import {connect} from "react-redux"
import moment from "moment"
import electron from "electron"
const {remote} = electron
import fs from "fs"
import {buildClientSchema} from 'graphql'
import applyVariablesToHeaders from "app/utils/apply-variables-to-headers"

export default ({actionCreators, selectors, queries, MapEditor, Panel, PanelHeader, PanelBody}) => {

    const mapStateToProps = (state, props) => ({
        project: selectors.findProject(state, {id: props.projectId}),
        environment: selectors.findEnvironment(state, {id: props.environmentId})
    })

    const mapDispatchToProps = dispatch => bindActionCreators(actionCreators, dispatch)

    class EnvironmentPanel extends React.Component {

        render() {

            return (
                <Panel
                    width={this.props.width}
                    height={this.props.height}
                >
                    <PanelHeader>
                        Environment
                    </PanelHeader>
                    <PanelBody>
                        <FormGroup
                            controlId="title"
                        >
                            <ControlLabel>Title</ControlLabel>
                            <FormControl
                                ref="title"
                                type="text"
                                value={this.props.environment.get('title')}
                                placeholder="Enter a title"
                                onChange={this.handleTitleChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Method</ControlLabel>
                            <select
                                ref="queryMethod"
                                name="queryMethod"
                                className="Select form-control"
                                value={this.props.environment.get('queryMethod')}
                                onChange={this.handleQueryMethod}
                            >
                                <option value="POST">POST</option>
                                <option value="GET">GET</option>
                            </select>
                        </FormGroup>
                        <FormGroup
                            controlId="url"
                        >
                            <ControlLabel>Url</ControlLabel>
                            <div className="UrlEditor">
                                <div className="UrlEditorSection">
                                    <FormControl
                                        ref="url"
                                        type="text"
                                        value={this.props.environment.get('url')}
                                        placeholder="Enter a url"
                                        onChange={this.handleUrlChange}
                                    />
                                </div>
                                <div className="UrlEditorSection">
                                    <div style={{marginBottom: 5}}>
                                        <strong>
                                            Valid
                                        </strong>
                                        <div className="pull-right">
                                            <div className="label label-primary">
                                                {this.props.environment.get('schemaResponse') ? 'YES' : 'NO'}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <strong>
                                            Updated at
                                        </strong>
                                        <div className="pull-right">
                                            {this.props.environment.get('schemaUpdatedAt') ? moment(this.props.environment.get('schemaUpdatedAt')).format('DD/MM/YYYY HH:mm') : '-'}
                                        </div>
                                    </div>
                                </div>
                                <div className="UrlEditorFooter">
                                    <a href="javascript:void(0)"
                                       onClick={() => this.refreshSchema(this.props.environment.get('url'))}>
                                        Refresh
                                    </a>
                                    {this.props.environment.get('schemaResponse') && (
                                        <a href="javascript:void(0)" className="pull-right"
                                           onClick={this.handleSaveSchema}>
                                            Save to file...
                                        </a>
                                    )}
                                </div>
                            </div>
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Variables</ControlLabel>
                            <MapEditor
                                value={this.props.environment.get('variables')}
                                noContentMessage="No variables (yet)"
                                onChange={this.handleVariablesChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Headers</ControlLabel>
                            <MapEditor
                                value={this.props.environment.get('headers')}
                                noContentMessage="No headers (yet)"
                                onChange={this.handleHeadersChange}
                            />
                        </FormGroup>
                    </PanelBody>
                </Panel>
            )
        }

        handleVariablesChange = ({value}) => {

            this.props.environmentsUpdate({
                id: this.props.environment.get('id'),
                data: {
                    variables: value
                }
            })
        }

        handleHeadersChange = ({value}) => {

            this.props.environmentsUpdate({
                id: this.props.environment.get('id'),
                data: {
                    headers: value
                }
            })
        }

        handleQueryMethod = e => {

            this.props.environmentsUpdate({
                id: this.props.environment.get('id'),
                data: {
                    queryMethod: e.target.value
                }
            })
        }

        handleTitleChange = e => {

            this.props.environmentsUpdate({
                id: this.props.environment.get('id'),
                data: {
                    title: e.target.value
                }
            })
        }

        handleUrlChange = e => {

            this.props.environmentsUpdate({
                id: this.props.environment.get('id'),
                data: {
                    url: e.target.value
                }
            })

            this.refreshSchema(e.target.value)
        }

        refreshSchema = (url) => {

            const environmentVariables = this.props.environment.get('variables')
            const environmentHeaders = this.props.environment.get('headers')
            const projectHeaders = this.props.project.get('headers')

            const mergedHeaders = projectHeaders
                .merge(environmentHeaders)

            const headers = applyVariablesToHeaders(environmentVariables, mergedHeaders)

            queries.fetchSchema({
                url: url,
                method: this.props.environment.get('queryMethod'),
                headers: headers
            }).then((response) => {

                const schema = buildClientSchema(response.data)

                if (schema) {
                    this.props.environmentsUpdate({
                        id: this.props.environment.get('id'),
                        data: {
                            schemaResponse: JSON.stringify(response.data),
                            schemaUpdatedAt: moment().utc().toISOString()

                        }
                    })
                }

            }).catch(() => {

                this.props.environmentsUpdate({
                    id: this.props.environment.get('id'),
                    data: {
                        schemaResponse: null,
                        schemaUpdatedAt: null
                    }
                })
            })
        }

        promptSaveDialog = () => {

            const filename = 'graphql_schema_' + moment().format('DD-MM-YYYY_HH-mm') + '.json'
            const downloadsPath = remote.app.getPath('downloads')

            return new Promise((resolve, reject) => {

                remote.dialog.showSaveDialog({
                    defaultPath: downloadsPath + '/' + filename,
                    filters: [{
                        name: 'JSON',
                        extensions: ['json']
                    }]
                }, (result) => {
                    resolve(result)
                })
            })
        }

        saveFile(filePath, data) {

            return new Promise((resolve, reject) => {

                data = JSON.stringify(data, null, 4)

                fs.writeFile(filePath, data, (err, result) => {

                    if (err) {
                        reject(err)
                        return
                    }

                    resolve(result)
                })
            })
        }

        handleSaveSchema = async() => {

            const filePath = await this.promptSaveDialog()

            if (filePath) {
                const data = JSON.parse(this.props.environment.get('schemaResponse'))
                return await this.saveFile(filePath, data)
            }
        }
    }

    return connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(EnvironmentPanel)
}