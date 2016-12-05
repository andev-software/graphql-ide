import React from "react"

export default () => {

    return class PanelHeader extends React.Component {

        render() {

            return (
                <div className="PanelHeader">
                    {this.props.children}
                </div>
            )
        }
    }
}