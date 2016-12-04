import React from "react"
import {Map} from "immutable"

export default (VariableItem) => {

    return class VariableEditor extends React.Component {

        state = {
            value: Map()
        }

        componentDidMount() {
            this.computeValue(this.props)
        }

        componentWillUpdate(nextProps) {

            if (this.props.value !== nextProps.value) {
                this.computeValue(nextProps)
            }
        }

        computeValue(props) {
            this.setState({
                value: props.value
            })
        }

        render() {

            return (
                <div
                    className="VariableEditor TopPane"
                    style={{
                        top: this.props.top,
                        width: this.props.width,
                        height: this.props.height
                    }}
                >
                    {this.state.value.size ? (
                        <div className="VariableEditorBody TopPaneBody">
                            {this.state.value.map((value, key, map) => {

                                const index = map.keySeq().indexOf(key)

                                console.log({
                                    key,
                                    value,
                                    index
                                })

                                return (
                                    <VariableItem
                                        key={index}
                                        id={key}
                                        value={value}
                                        onKeyChange={this.handleKeyChange}
                                        onValueChange={this.handleValueChange}
                                        onRemove={this.handleRemove}
                                    />
                                )
                            }).toArray()}
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

            if (this.state.value.has('')) {
                return
            }

            this.setState({
                value: this.state.value.set('', '')
            }, () => this.emitChanges())
        }

        handleKeyChange = ({id, key}) => {

            const value = this.state.value.get(id)

            this.setState({
                value: this.state.value
                    .remove(id)
                    .set(key, value)
            }, () => this.emitChanges())
        }

        handleValueChange = ({id, value}) => {

            console.log('id', id, 'value', value)

            this.setState({
                value: this.state.value
                    .set(id, value)
            }, () => this.emitChanges())
        }

        handleRemove = ({id}) => {

            this.setState({
                value: this.state.value.remove(id)
            }, () => this.emitChanges())
        }

        handleClearClick = e => {

            this.setState({
                value: Map()
            }, () => this.emitChanges())
        }

        emitChanges() {

            this.props.onChange({
                value: this.state.value
            })
        }
    }
}