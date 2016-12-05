import React from "react"
import ReactDOM from "react-dom"
import cn from "classnames"
import {FormGroup, FormControl, ControlLabel} from "react-bootstrap"

export default () => {

    return class MapItem extends React.Component {

        componentDidMount() {

            if (this.refs.key) {
                ReactDOM.findDOMNode(this.refs.key).focus()
            }
        }

        render() {

            return (
                <div className="MapItem">
                    <FormGroup
                        controlId="key"
                    >
                        <FormControl
                            ref="title"
                            type="text"
                            value={this.props.id}
                            placeholder="key"
                            onChange={this.handleKeyChange}
                        />
                    </FormGroup>
                    <FormGroup
                        controlId="key"
                    >
                        <FormControl
                            ref="title"
                            type="text"
                            value={this.props.value}
                            placeholder="value"
                            onChange={this.handleValueChange}
                        />
                    </FormGroup>
                    <div className="MapItemFooter">
                        <a
                            href="javascript:void(0)"
                            onClick={this.handleRemove}
                        >
                            Remove
                        </a>
                    </div>
                </div>
            )
        }

        handleKeyChange = e => {

            this.props.onKeyChange({
                e,
                id: this.props.id,
                key: e.target.value
            })
        }

        handleValueChange = e => {

            this.props.onValueChange({
                e,
                id: this.props.id,
                value: e.target.value
            })
        }

        handleRemove = e => {

            this.props.onRemove({
                id: this.props.id
            })
        }
    }
}