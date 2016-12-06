import React from "react"
import ReactDOM from "react-dom"
import {Alert, Modal, FormGroup, FormControl, ControlLabel} from "react-bootstrap"
import {Map, List} from "immutable"
import {bindActionCreators} from "redux"
import {connect} from "react-redux"
import moment from "moment"

export default ({actionCreators, selectors, MapEditor, Panel, PanelHeader, PanelBody, PanelFooter}) => {

    const mapStateToProps = (state, props) => ({
        query: selectors.findQuery(state, {id: props.queryId})
    })

    const mapDispatchToProps = dispatch => bindActionCreators(actionCreators, dispatch)

    class QueryPanel extends React.Component {

        state = {
            errors: List(),
            changed: Map({
                title: false
            }),
            query: null
        }

        componentDidMount() {

            if (this.refs.title) {
                ReactDOM.findDOMNode(this.refs.title).focus()
            }
        }

        render() {

            if (!this.props.query) {
                return (
                    <div className="QueryPanel__Empty">
                        <div className="QueryPanel__EmptyMessage">
                            No query selected
                        </div>
                    </div>
                )
            }

            const typeInfoItems = {
                HISTORY: [{
                    key: 'Executed at',
                    value: moment(this.props.query.get('createdAt')).format('DD/MM/YYYY HH:mm')
                }],
                COLLECTION: [{
                    key: 'Updated at',
                    value: moment(this.props.query.get('updatedAt')).format('DD/MM/YYYY HH:mm')
                }, {
                    key: 'Created at',
                    value: moment(this.props.query.get('createdAt')).format('DD/MM/YYYY HH:mm')
                }],
            }

            const additionalInfoItems = typeInfoItems[this.props.query.get('type')] || []

            const infoItems = [{
                key: 'Type',
                value: (
                    <div className="label label-primary">
                        {this.props.query.get('type')}
                    </div>
                )
            }].concat(additionalInfoItems)

            return (
                <Panel
                    width={this.props.width}
                    height={this.props.height}
                >
                    <PanelHeader>
                        Query
                    </PanelHeader>
                    <PanelBody hasFooter={true}>
                        <FormGroup
                            controlId="title"
                        >
                            <ControlLabel>Title</ControlLabel>
                            <FormControl
                                ref="title"
                                type="text"
                                disabled="true"
                                value={this.props.query.get('operationName') || ''}
                                placeholder="Enter a title"
                                onChange={() => null}
                            />
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Headers</ControlLabel>
                            <MapEditor
                                value={this.props.query.get('headers')}
                                noContentMessage="No headers (yet)"
                                onChange={this.handleHeadersChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>
                                Info
                            </ControlLabel>
                            <div className="QueryMeta">
                                {infoItems.map((item, index) => (
                                    <div key={index} className="QueryMetaItem">
                                        <div className="row">
                                            <div className="col-xs-6">
                                                {item.key}
                                            </div>
                                            <div className="col-xs-6">
                                                {item.value}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </FormGroup>
                    </PanelBody>
                    <PanelFooter>
                        <button type="button" className="btn btn-sm btn-primary" onClick={this.handleRemove}>Delete
                        </button>
                    </PanelFooter>
                </Panel>
            )
        }

        handleHeadersChange = ({value}) => {

            this.props.queriesUpdate({
                id: this.props.query.get('id'),
                data: {
                    headers: value,
                    updatedAt: moment().utc().toISOString()
                }
            })
        }

        handleRemove = () => {

            this.props.projectsDetachCollectionQuery({
                projectId: this.props.projectId,
                queryId: this.props.queryId
            })

            this.props.queriesRemove({
                id: this.props.query.get('id')
            })
        }
    }

    return connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(QueryPanel)
}