import React from "react"

export default () => {

    return class PanelBody extends React.Component {

        render() {

            return (
                <div className="PanelBody">
                    {this.props.children}
                </div>
            )
        }
    }
}