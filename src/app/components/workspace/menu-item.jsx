import React from "react"
import cn from "classnames"

export default () => {

    return class MenuItem extends React.Component {

        render() {

            return (
                <div
                    className="MenuItem"
                >
                    <button
                        disabled={this.props.disabled}
                        className={cn('button', {
                            active: this.props.active
                        })}
                        onClick={this.props.onClick}
                    >
                        <span className="Label">
                            {this.props.description}
                        </span>
                    </button>
                </div>
            )
        }
    }
}