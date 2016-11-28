import React from "react"
import {Map, List} from "immutable"

export default (VariableItem) => {

    return class VariableEditor extends React.Component {

        state = {
            variables: List()
        }

        componentDidMount() {
            this.computeVariables(this.props)
        }

        componentWillUpdate(nextProps) {

            if (this.props.variables !== nextProps.variables) {
                this.computeVariables(nextProps)
            }
        }

        computeVariables(props) {
            this.setState({
                variables: props.variables
            })
        }

        render() {

            const keyBlacklist = this.state.variables.map(variable => variable.get('key'))

            return (
                <div
                    className="VariableEditor TopPane"
                    style={{
                        top: this.props.top,
                        width: this.props.width,
                        height: this.props.height
                    }}
                >
                    {this.state.variables.size ? (
                        <div className="VariableEditorBody TopPaneBody">
                            {this.state.variables.map((variable, index) => (
                                <VariableItem
                                    key={index}
                                    id={index}
                                    variable={variable}
                                    keyBlacklist={keyBlacklist.remove(index)}
                                    onChange={this.handleChange}
                                    onRemove={this.handleRemove}
                                />
                            )).toArray()}
                        </div>
                    ) : (
                        <div className="VariableEditorBody TopPaneBody">
                            <div className="NoContent">
                                <div className="NoContent__Message">
                                    No variables (yet)
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="VariableEditorFooter TopPaneFooter">
                        <div className="Menu--horizontal Menu--right">
                            <div className="MenuItem">
                                <button
                                    type="button"
                                    className="button"
                                    onClick={this.handleClearClick}
                                >
                                    Clear variables
                                </button>
                            </div>
                            <div className="MenuItem">
                                <button
                                    type="button"
                                    className="button"
                                    onClick={this.handleAddClick}
                                >
                                    Add variable
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        handleAddClick = e => {

            if (this.state.variables.find(variable => variable.get('key') === '')) {
                return
            }

            this.setState({
                variables: this.state.variables.push(Map({
                    key: '',
                    value: ''
                }))
            }, () => this.emitChanges())
        }

        handleChange = ({id, variable}) => {

            this.setState({
                variables: this.state.variables.set(id, variable)
            }, () => this.emitChanges())
        }

        handleRemove = ({id}) => {

            this.setState({
                variables: this.state.variables.remove(id)
            }, () => this.emitChanges())
        }

        handleClearClick = e => {

            this.setState({
                variables: List()
            }, () => this.emitChanges())
        }

        emitChanges() {

            this.props.onChange({
                variables: this.state.variables
            })
        }
    }
}