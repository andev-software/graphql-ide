import validator from "validator"
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

        componentWillMount() {
            this.updateQuery(this.props)
        }

        componentWillUpdate(nextProps) {

            if (this.props.query !== nextProps.query) {
                this.updateQuery(nextProps)
            }
        }

        updateQuery(props) {
            this.setState({
                query: props.query
            })
        }

        componentDidMount() {

            this.validate()

            if (this.refs.title) {
                ReactDOM.findDOMNode(this.refs.title).focus()
            }
        }

        validate() {

            const title = this.state.query.get('title') || ''

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
                query: this.state.query.set(property, value)
            }, () => {
                this.validate()
                cb()
            })
        }

        render() {

            const typeInfoItems = {
                HISTORY: [{
                    key: 'Executed at',
                    value: moment(this.state.query.get('createdAt')).format('DD/MM/YYYY HH:mm')
                }],

            }

            const additionalInfoItems = typeInfoItems[this.state.query.get('type')] || []

            const infoItems = [{
                key: 'ID',
                value: this.state.query.get('id')
            }, {
                key: 'Type',
                value: (
                    <div className="label label-primary">
                        {this.state.query.get('type')}
                    </div>
                )
            }].concat(additionalInfoItems)

            return (
                <Panel
                    width={this.props.width}
                    height={this.props.height}
                >
                    <form onSubmit={this.handleSubmit}>
                        <PanelHeader>
                            Query
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
                                    disabled="true"
                                    value={this.state.query.get('operationName') || ''}
                                    placeholder="Enter a title"
                                    onChange={this.handleTitleChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <ControlLabel>Headers</ControlLabel>
                                <MapEditor
                                    value={this.state.query.get('headers')}
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
                            <button type="submit" className="btn btn-sm btn-primary">Save</button>
                        </PanelFooter>
                    </form>
                </Panel>
            )
        }

        handleHeadersChange = ({value}) => {

            this.setState({
                query: this.state.query.set('headers', value)
            })
        }

        handleTitleChange = e => {

            this.updateProperty({
                property: 'title',
                value: e.target.value
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

            this.props.queriesUpdate({
                id: this.state.query.get('id'),
                data: {
                    title: this.state.query.get('title'),
                    headers: this.state.query.get('headers')
                }
            })

            this.props.onClose()
        }
    }

    return connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(QueryPanel)
}