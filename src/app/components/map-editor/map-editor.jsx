import React from "react"
import {Map} from "immutable"

export default (MapItem) => {

    return class MapEditor extends React.Component {

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
                    className="MapEditor"
                    style={{
                        top: this.props.top,
                        width: this.props.width,
                        height: this.props.height
                    }}
                >
                    {this.state.value.size ? (
                        <div className="list-group-items">
                            {this.state.value.map((value, key, map) => {

                                const index = map.keySeq().indexOf(key)

                                return (
                                    <MapItem
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
                        <div className="MapEditorBody">
                            <div className="NoContent">
                                <div className="NoContent__Message">
                                    {this.props.noContentMessage}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="MapEditorFooter">
                        <div className="Menu--horizontal Menu--right">
                            <div className="MenuItem">
                                <a
                                    href="javascript:void(0)"
                                    onClick={this.handleClearClick}
                                >
                                    Clear
                                </a>
                            </div>
                            <div className="MenuItem">
                                <a
                                    href="javascript:void(0)"
                                    onClick={this.handleAddClick}
                                >
                                    Add
                                </a>
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