
import validator from "validator"
import React from "react"
import ReactDOM from "react-dom"
import {Alert, Modal, FormGroup, FormControl, ControlLabel} from "react-bootstrap"
import {Map, List} from "immutable"
import {bindActionCreators} from "redux"
import {connect} from "react-redux"
import moment from "moment"
import electron from "electron"
const {remote} = electron
import fs from "fs"

export default ({actionCreators, selectors, queries, MapEditor, Panel, PanelHeader, PanelBody, PanelFooter}) => {

    const mapStateToProps = (state, props) => ({
        environment: selectors.findEnvironment(state, {id: props.environmentId})
    })

    const mapDispatchToProps = dispatch => bindActionCreators(actionCreators, dispatch)

    class EnvironmentPanel extends React.Component {

        state = {
            errors: List(),
            changed: Map({
                title: false,
                url: false
            }),
            environment: null
        }

        componentWillMount() {
            this.updateEnvironment(this.props)
        }

        componentWillUpdate(nextProps) {

            if (this.props.environment !== nextProps.environment) {
                this.updateEnvironment(nextProps)
            }
        }

        updateEnvironment(props) {
            this.setState({
                environment: props.environment
            })
        }

        componentDidMount() {

            this.validate()

            if (this.refs.title) {
                ReactDOM.findDOMNode(this.refs.title).focus()
            }
        }

        validate() {

            const title = this.state.environment.get('title')
            const url = this.state.environment.get('url')

            const checks = [() => {

                const opts = {
                    min: 3,
                    max: 255
                }

                if (!validator.isLength(title, opts)) {
                    return Map({
                        name: 'title',
                        message: `Length of 'Title' should be between ${opts.min} and ${opts.max} characters long`
                    })
                }

            }, () => {

                const opts = {
                    min: 0,
                    max: 255
                }

                if (!validator.isLength(url, opts)) {
                    return Map({
                        name: 'url',
                        message: `'Url' should not exceed ${opts.max} characters`
                    })
                }

            }]

            const errors = checks.reduce((result, check) => {

                const error = check()

                if (error) {
                    return result.push(error)
                }

                return result

            }, List())

            this.setState({
                errors
            })
        }

        getValidationState = (fieldName) => {

            const error = this.state.errors.find(field => field.get('name') === fieldName)

            if (this.state.changed.get(fieldName)) {
                return error ? 'error' : 'success'
            }

            return null
        }

        updateProperty = ({property, value}, cb) => {

            this.setState({
                message: null,
                changed: this.state.changed.set(property, true),
                environment: this.state.environment.set(property, value)
            }, () => {
                this.validate()
                cb()
            })
        }

        render() {

            return (
                <Panel
                    width={this.props.width}
                    height={this.props.height}
                >
                    <form onSubmit={this.handleSubmit}>
                        <PanelHeader>
                            Environment
                        </PanelHeader>
                        <PanelBody>
                            {this.state.message ? (
                                <Alert bsStyle="danger">
                                    {this.state.message}
                                </Alert>
                            ) : null}
                            <FormGroup
                                controlId="title"
                                validationState={this.getValidationState('title')}
                            >
                                <ControlLabel>Title</ControlLabel>
                                <FormControl
                                    ref="title"
                                    type="text"
                                    value={this.state.environment.get('title')}
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
                                    value={this.state.environment.get('queryMethod')}
                                    onChange={this.handleQueryMethod}
                                >
                                    <option value="POST">POST</option>
                                    <option value="GET">GET</option>
                                </select>
                            </FormGroup>
                            <FormGroup
                                controlId="url"
                                validationState={this.getValidationState('url')}
                            >
                                <ControlLabel>Url</ControlLabel>
                                <div className="UrlEditor">
                                    <div className="UrlEditorSection">
                                        <FormControl
                                            ref="url"
                                            type="text"
                                            value={this.state.environment.get('url')}
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
                                                    {this.state.environment.get('schemaResponse') ? 'YES' : 'NO'}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <strong>
                                                Updated at
                                            </strong>
                                            <div className="pull-right">
                                                {this.state.environment.get('schemaUpdatedAt') ? moment(this.state.environment.get('schemaUpdatedAt')).format('DD/MM/YYYY HH:mm') : '-'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="UrlEditorFooter">
                                        <a href="javascript:void(0)" onClick={this.refreshSchema}>
                                            Refresh
                                        </a>
                                        {this.state.environment.get('schemaResponse') && (
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
                                    value={this.state.environment.get('variables')}
                                    noContentMessage="No variables (yet)"
                                    onChange={this.handleVariablesChange}
                                />
                            </FormGroup>
                        </PanelBody>
                        <PanelFooter>
                            <button type="submit" className="btn btn-sm btn-primary">Save</button>
                        </PanelFooter>
                    </form>
                </Panel>
            )
        }

        handleVariablesChange = ({value}) => {

            this.setState({
                environment: this.state.environment.set('variables', value)
            })
        }

        handleQueryMethod = e => {

            this.updateProperty({
                property: 'queryMethod',
                value: e.target.value
            })
        }

        handleTitleChange = e => {

            this.updateProperty({
                property: 'title',
                value: e.target.value
            })
        }

        handleUrlChange = e => {

            this.updateProperty({
                property: 'url',
                value: e.target.value
            }, () => {
                this.refreshSchema()
            })
        }

        handleSubmit = e => {

            e.preventDefault()
            e.stopPropagation()

            if (!this.state.errors.isEmpty()) {
                this.setState({
                    message: (
                        <ul>
                            {this.state.errors.map((error, index) => (
                                <li key={index}>
                                    {error.get('message')}
                                </li>
                            )).toArray()}
                        </ul>
                    )
                })
                return
            }

            this.props.environmentsUpdate({
                id: this.state.environment.get('id'),
                data: this.state.environment
            })

            this.props.onClose()
        }

        refreshSchema = () => {

            queries.fetchSchema({
                url: this.state.environment.get('url'),
                method: this.state.environment.get('queryMethod')
            }).then((response) => {

                this.setState({
                    environment: this.state.environment
                        .set('schemaResponse', JSON.stringify(response.data))
                        .set('schemaUpdatedAt', moment().utc().toISOString())
                })
            }).catch(() => {

                this.setState({
                    environment: this.state.environment
                        .set('schemaResponse', null)
                        .set('schemaUpdatedAt', null)
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
                console.log('filePath', filePath)
                const data = JSON.parse(this.state.environment.get('schemaResponse'))
                return await this.saveFile(filePath, data)
            }
        }
    }

    return connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(EnvironmentPanel)
}