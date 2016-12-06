import React from "react"
import electron from "electron"
import moment from "moment"
import {connect} from "react-redux"
import {bindActionCreators} from "redux"
import {List} from "immutable"

export default ({vex, actionCreators, selectors, factories, importExport, history, Layout, WorkspaceHeader, MenuItem, ProjectListItem}) => {

    const mapStateToProps = (state, props) => ({
        projects: selectors.allProjects(state)
    })

    const mapDispatchToProps = dispatch => bindActionCreators(actionCreators, dispatch)

    class ProjectList extends React.Component {

        render() {

            const HEADER_HEIGHT = 40

            const leftButtons = [{
                description: 'Import',
                onClick: this.handleProjectImport
            }]

            const headerLeft = (
                <div className="Menu Menu--horizontal">
                    {leftButtons.map((item, key) => (
                        <MenuItem
                            key={key}
                            active={item.active}
                            description={item.description}
                            onClick={item.onClick}
                        />
                    ))}
                </div>
            )

            const rightButtons = [{
                description: 'Quit',
                onClick: () => {
                    electron.remote.app.quit()
                }
            }]

            const headerRight = (
                <div className="Menu Menu--horizontal Menu--right">
                    {rightButtons.map((item, key) => (
                        <MenuItem
                            key={key}
                            active={item.active}
                            description={item.description}
                            onClick={item.onClick}
                        />
                    ))}
                </div>
            )

            return (
                <Layout>
                    {({width, height}) => (
                        <div
                            className="ProjectList"
                            style={{
                                width,
                                height
                            }}
                        >
                            <WorkspaceHeader
                                width={width}
                                height={HEADER_HEIGHT}
                                left={headerLeft}
                                right={headerRight}
                            />
                            <div
                                className="ProjectListContent"
                                style={{
                                    top: HEADER_HEIGHT,
                                    width,
                                    height: height - HEADER_HEIGHT
                                }}
                            >
                                <div className="container">
                                    <div className="page-header">
                                        <h2>
                                            Projects
                                        </h2>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-6 col-md-4">
                                            <ProjectListItem
                                                backgroundColor="#eee"
                                                color="#222"
                                                shortname="+"
                                                title={"New project"}
                                                description={"Click to start new project"}
                                                onClick={this.handleNewClick}
                                            />
                                        </div>
                                        {this.props.projects.map(project => (
                                            <div key={project.get('id')} className="col-sm-6 col-md-4">
                                                <ProjectListItem
                                                    id={project.get('id')}
                                                    backgroundColor="#E10098"
                                                    color="#fff"
                                                    shortname={(project.get('title') || "").substring(0, 2)}
                                                    title={project.get('title')}
                                                    description={project.get('description')}
                                                    meta={moment(project.get('updatedAt')).format('DD/MM/YYYY HH:mm')}
                                                    onClick={this.handleClick}
                                                    onRemove={this.handleRemove}
                                                    onExport={this.handleProjectExport}
                                                    onVersionOneExport={this.handleVersionOneProjectExport}
                                                />
                                            </div>
                                        )).toArray()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Layout>
            )
        }

        handleProjectImport = () => {

            importExport.importProject()
        }

        handleProjectExport = ({id}) => {

            importExport.exportProject({projectId: id})
        }

        handleVersionOneProjectExport = ({id}) => {

            importExport.exportVersionOneProject({projectId: id})
        }

        handleClick = ({id}) => {

            history.push('/project/' + id)
        }

        handleRemove = ({id}) => {

            this.props.projectsRemove({
                id
            })
        }

        handleNewClick = () => {


            swal({
                title: 'Add project',
                text: "Choose a name for the project",
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

                const project = factories.createProject()
                const environment = factories.createEnvironment()

                this.props.environmentsCreate({
                    id: environment.get('id'),
                    data: environment
                })

                this.props.projectsCreate({
                    id: project.get('id'),
                    data: project.merge({
                        title: value,
                        activeEnvironmentId: environment.get('id'),
                        environmentIds: List([
                            environment.get('id')
                        ])
                    })
                })
            })
        }
    }

    return connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(ProjectList)
}