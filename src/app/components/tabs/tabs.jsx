import React from "react"

export default (TabItem, TabAddButton) => {

    return class Tabs extends React.Component {

        render() {

            const ADD_TAB_SIZE = this.props.height

            const tabMaxWidth = (this.props.width - ADD_TAB_SIZE) / this.props.tabs.size

            return (
                <ul
                    className="Tabs"
                    style={{
                        width: this.props.width,
                        height: this.props.height
                    }}
                >
                    {this.props.tabs.map((tab, index) => (
                        <TabItem
                            key={index}
                            id={tab.get('id')}
                            width={Math.min(tabMaxWidth, 150)}
                            maxWidth={tabMaxWidth}
                            active={tab.get('id') === this.props.activeId}
                            title={tab.get('title')}
                            onClick={this.handleClick}
                            onRemove={this.handleRemove}
                        />
                    )).toArray()}
                    <TabAddButton
                        width={ADD_TAB_SIZE}
                        onClick={this.handleAdd}
                    />
                </ul>
            )
        }

        handleAdd = (e) => {
            this.props.onAdd({
                e
            })
        }

        handleClick = (params) => {
            this.props.onClick(params)
        }

        handleRemove = (params) => {
            this.props.onRemove(params)
        }
    }
}