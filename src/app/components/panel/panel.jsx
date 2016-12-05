import React from "react"

export default () => {

    return class Panel extends React.Component {

        render() {

            return (
                <div
                    className="Panel"
                    style={{
                        width: this.props.width,
                        height: this.props.height
                    }}
                >
                    {this.props.children}
                </div>
            )
        }
    }
}