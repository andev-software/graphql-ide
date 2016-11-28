import React from "react"
import cn from "classnames"

export default () => {

    return class TabItem extends React.Component {

        render() {

            return (
                <li
                    className={cn("TabElement", "TabItem", {
                        active: this.props.active
                    })}
                    onClick={this.handleClick}
                    style={{
                        width: this.props.width,
                        maxWidth: this.props.maxWidth
                    }}
                >
                    <div className="Title">
                        {this.props.title}
                    </div>
                    <div
                        className="close-icon"
                        onClick={this.handleRemove}
                    >
                    </div>
                </li>
            )
        }

        handleClick = (e) => {

            this.props.onClick({
                id: this.props.id,
                e
            })
        }

        handleRemove = (e) => {

            e.stopPropagation()

            this.props.onRemove({
                id: this.props.id,
                e
            })
        }
    }
}