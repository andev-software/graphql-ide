import validator from "validator"
import React from "react"
import ReactDOM from "react-dom"
import {Alert, Modal, FormGroup, FormControl, ControlLabel} from "react-bootstrap"
import {Map, List} from "immutable"
import swal from "sweetalert"

export default ({factories, MapEditor, Panel, PanelHeader, PanelBody, PanelFooter}) => {

    return class ProjectPanel extends React.Component {

        state = {
            errors: List(),
            changed: Map({
                title: false,
                description: false
            }),
            project: Map({
                title: '',
                description: ''
            })
        }


        componentWillMount() {
            this.updateProject(this.props)
        }

        componentWillUpdate(nextProps) {

            if (this.props.project !== nextProps.project) {
                this.updateProject(nextProps)
            }
        }

        updateProject(props) {
            this.setState({
                project: props.project
            })
        }

        componentDidMount() {

            this.validate()

            if (this.refs.title) {
                ReactDOM.findDOMNode(this.refs.title).focus()
            }
        }

        validate() {

            const title = this.state.project.get('title')
            const description = this.state.project.get('description')

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
                    max: 500
                }

                if (!validator.isLength(description, opts)) {
                    return Map({
                        name: 'title',
                        message: `'Description' should not exceed ${opts.max} characters`
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

        handleTitleChange = e => {

            this.updateProjectProperty({
                property: 'title',
                value: e.target.value
            })
        }

        handleDescriptionChange = e => {

            this.updateProjectProperty({
                property: 'description',
                value: e.target.value
            })
        }

        updateProjectProperty = ({property, value}) => {

            this.setState({
                message: null,
                changed: this.state.changed.set(property, true),
                project: this.state.project.set(property, value)
            }, () => {
                this.validate()
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

            this.props.onUpdate({
                project: this.state.project
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
                            Project settings
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
                                    value={this.state.project.get('title')}
                                    placeholder="Enter a title"
                                    onChange={this.handleTitleChange}
                                />
                            </FormGroup>
                            <FormGroup
                                controlId="description"
                                validationState={this.getValidationState('description')}
                            >
                                <ControlLabel>Description</ControlLabel>
                                <FormControl
                                    componentClass="textarea"
                                    value={this.state.project.get('description')}
                                    placeholder="Enter an description"
                                    onChange={this.handleDescriptionChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <ControlLabel>Environments</ControlLabel>
                                <div className="EnvironmentList">
                                    {this.props.project.get('environments').map(environment => (
                                        <div
                                            key={environment.get('id')}
                                            className="EnvironmentItem"
                                        >
                                            <div style={{marginBottom: 5}}>
                                                <strong>
                                                    {environment.get('title')}
                                                </strong>
                                                <div className="pull-right">
                                                    <a
                                                        href="javascript:void(0)"
                                                        onClick={() => this.handleEnvironmentEdit({id: environment.get('id')})}
                                                    >
                                                        Edit
                                                    </a>
                                                    {this.props.project.get('environments').size > 1 && ' / '}
                                                    {this.props.project.get('environments').size > 1 && (
                                                        <a
                                                            href="javascript:void(0)"
                                                            onClick={() => this.handleEnvironmentRemove({id: environment.get('id')})}
                                                        >
                                                            Remove
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <small className="text-muted">
                                                {environment.get('url') || "No url provided"}
                                            </small>

                                        </div>
                                    )).toArray()}
                                    <div className="EnvironmentFooter">
                                        <a href="javascript:void(0)" onClick={this.handleEnvironmentAdd}>
                                            Add environment
                                        </a>
                                    </div>
                                </div>
                            </FormGroup>
                            <FormGroup>
                                <ControlLabel>Headers</ControlLabel>
                                <MapEditor
                                    value={this.state.project.get('headers')}
                                    noContentMessage="No headers (yet)"
                                    onChange={this.handleHeadersChange}
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

        handleHeadersChange = ({value}) => {

            this.setState({
                project: this.state.project.set('headers', value)
            })
        }

        promptEnvironmentName = () => {

            swal({
                title: 'Add environment',
                text: "Choose a name for the environment",
                type: 'input',
                showCancelButton: true,
                closeOnConfirm: true,
                animation: false
            }, (value) => {

                if (value === false) {
                    return
                }

                if (!value || !value.length) {

                    swal({
                        title: "Hey Ya!",
                        text: "You might want to fill in a name!",
                        type: "error",
                        animation: false
                    })
                    return
                }

                const environment = factories.createEnvironment()
                this.props.onEnvironmentAdd({
                    environment: environment.merge({
                        title: value
                    })
                })
            })
        }

        handleEnvironmentAdd = () => {
            this.promptEnvironmentName()
        }

        handleEnvironmentEdit = ({id}) => {
            this.props.onEnvironmentEdit({id})
        }

        handleEnvironmentRemove = ({id}) => {
            this.props.onEnvironmentRemove({id})
        }
    }
}