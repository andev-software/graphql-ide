import React from "react"
import cn from "classnames"

export default () => {

    return class PanelBody extends React.Component {

        render() {

            return (
                <div
                    className={cn("PanelBody", {
                        "PanelBody--has-footer": this.props.hasFooter
                    })
                    }
                >
                    {this.props.children}
                </div>
            )
        }
    }
}