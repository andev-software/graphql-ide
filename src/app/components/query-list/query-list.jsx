import React from "react"
import ReactList from "react-list"

export default (QueryListItem) => {

    return class QueryList extends React.Component {

        state = {
            query: ''
        }

        componentWillMount() {

            this.filterData({
                query: this.state.query,
                props: this.props
            })
        }

        componentWillUpdate(nextProps) {

            if (this.props.data !== nextProps.data) {
                this.filterData({
                    query: this.state.query,
                    props: nextProps
                })
            }
        }

        filterData({props, query}) {

            const filterFn = item => {
                return item.get('title').toLowerCase().indexOf(query.toLowerCase()) !== -1
            }

            this.setState({
                data: props.data.filter(item => filterFn(item))
            })
        }

        render() {

            return (
                <div className="QueryList">
                    <div className="QueryListFilter">
                        <div className="Filter">
                            <input className="FilterInput" placeholder="Filter" value={this.state.query}
                                   onChange={this.handleQueryChange}/>
                        </div>
                    </div>
                    <div className="QueryListContent">
                        <ReactList
                            type="uniform"
                            length={this.state.data.size}
                            itemRenderer={this.handleItemRender}
                        />
                    </div>
                </div>
            )
        }

        handleQueryChange = e => {

            this.setState({
                query: e.target.value
            }, () => this.filterData({
                props: this.props,
                query: this.state.query
            }))
        }

        handleItemRender = (index, key) => {

            const item = this.state.data.get(index)

            return (
                <QueryListItem
                    key={key}
                    id={item.get('id')}
                    active={this.props.activeId === item.get('id')}
                    shortname={item.get('shortname')}
                    title={item.get('title')}
                    meta={item.get('meta')}
                    subTitle={item.get('subTitle')}
                    subMeta={item.get('subMeta')}
                    onClick={this.handleClick}
                    onRemove={this.handleRemove}
                />
            )
        }

        handleClick = ({e, id}) => {

            this.props.onItemClick({
                e,
                id
            })
        }

        handleRemove = ({e, id}) => {

            this.props.onItemRemove({
                e,
                id
            })
        }
    }
}