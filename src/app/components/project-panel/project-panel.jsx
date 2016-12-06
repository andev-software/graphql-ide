import React from "react"
import {Alert, Modal, FormGroup, FormControl, ControlLabel} from "react-bootstrap"
import swal from "sweetalert"
import {connect} from "react-redux"
import {bindActionCreators} from "redux"

export default ({factories, actionCreators, selectors, MapEditor, Panel, PanelHeader, PanelBody}) => {

    const mapStateToProps = (state, props) => ({
        project: selectors.findProject(state, {id: props.projectId})
    })

    const mapDispatchToProps = dispatch => bindActionCreators(actionCreators, dispatch)

    class ProjectPanel extends React.Component {

        render() {

            return (
                <Panel
                    width={this.props.width}
                    height={this.props.height}
                >
                    <PanelHeader>
                        Project
                    </PanelHeader>
                    <PanelBody>
                        <FormGroup
                            controlId="title"
                        >
                            <ControlLabel>Title</ControlLabel>
                            <FormControl
                                ref="title"
                                type="text"
                                value={this.props.project.get('title')}
                                placeholder="Enter a title"
                                onChange={this.handleTitleChange}
                            />
                        </FormGroup>
                        <FormGroup
                            controlId="description"
                        >
                            <ControlLabel>Description</ControlLabel>
                            <FormControl
                                componentClass="textarea"
                                value={this.props.project.get('description')}
                                placeholder="Enter an description"
                                onChange={this.handleDescriptionChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Active environment</ControlLabel>
                            <select
                                ref="activeEnvironmentId"
                                name="activeEnvironmentId"
                                className="Select form-control"
                                value={this.props.project.get('activeEnvironmentId')}
                                onChange={this.handleActiveEnvironmentIdChange}
                            >
                                {this.props.project.get('environments').map(environment => (
                                    <option key={environment.get('id')}
                                            value={environment.get('id')}>{environment.get('title')}</option>
                                )).toArray()}
                            </select>
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
                                value={this.props.project.get('headers')}
                                noContentMessage="No headers (yet)"
                                onChange={this.handleHeadersChange}
                            />
                        </FormGroup>
                    </PanelBody>
                </Panel>
            )
        }

        handleActiveEnvironmentIdChange = e => {

            this.props.projectsUpdate({
                id: this.props.project.get('id'),
                data: {
                    activeEnvironmentId: e.target.value
                }
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

        handleTitleChange = e => {

            this.props.projectsUpdate({
                id: this.props.project.get('id'),
                data: {
                    title: e.target.value
                }
            })
        }

        handleDescriptionChange = e => {

            this.props.projectsUpdate({
                id: this.props.project.get('id'),
                data: {
                    description: e.target.value
                }
            })
        }

        handleEnvironmentAdd = () => {

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
                        title: "Error",
                        text: "You might want to fill in a name!",
                        type: "error",
                        animation: false
                    })
                    return
                }

                const environment = factories.createEnvironment().merge({
                    title: value
                })

                this.props.environmentsCreate({
                    id: environment.get('id'),
                    data: environment
                })

                this.props.projectsAttachEnvironment({
                    projectId: this.props.project.get('id'),
                    environmentId: environment.get('id')
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
    }

    return connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(ProjectPanel)
}