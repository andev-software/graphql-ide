import React from "react"
import ReactDOM from "react-dom"
import cn from "classnames"

export default () => {

    return class VariableItem extends React.Component {

        componentDidMount() {

            if (this.refs.key) {
                ReactDOM.findDOMNode(this.refs.key).focus()
            }
        }

        render() {

            return (
                <div className="VariableItem">
                    <div className="VariableItem__Element VariableItem__Key">
                        <input
                            ref="key"
                            className={cn("Input", {error: this.props.invalid})}
                            value={this.props.id}
                            onChange={this.handleKeyChange}
                        />
                    </div>
                    <div className="VariableItem__Element VariableItem__Value">
                        <input
                            ref="value"
                            className="Input"
                            value={this.props.value}
                            onChange={this.handleValueChange}
                        />
                    </div>
                    <div className="VariableItem__Element VariableItem__RemoveButton">
                        <button
                            type="button"
                            className="button"
                            onClick={this.handleRemove}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            )
        }

        handleKeyChange = e => {

            this.props.onKeyChange({
                e,
                id: this.props.id,
                key: this.refs.key.value
            })
        }

        handleValueChange = e => {

            this.props.onValueChange({
                e,
                id: this.props.id,
                value: this.refs.value.value
            })
        }

        handleRemove = e => {

            this.props.onRemove({
                id: this.props.id
            })
        }
    }
}