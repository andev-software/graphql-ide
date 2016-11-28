import React from "react"

export default () => {

    return class TabAddButton extends React.Component {

        render() {

            return (
                <li
                    className="TabElement TabAddButton"
                    onClick={this.handleClick}
                    style={{
                        width: this.props.width
                    }}
                >
                    <div className="add-icon"></div>
                </li>
            )
        }

        handleClick = (e) => {
            this.props.onClick({
                e
            })
        }
    }
}