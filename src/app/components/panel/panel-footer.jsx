import React from "react"

export default () => {

    return class PanelFooter extends React.Component {

        render() {

            return (
                <div className="PanelFooter">
                    {this.props.children}
                </div>
            )
        }
    }
}