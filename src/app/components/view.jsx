import React from "react"
import map from "lodash/map"
import reduce from "lodash/reduce"
import extend from "lodash/extend"

export default (Loader) => {

    return (mapQueriesToProps, mapMutationsToProps) => {

        return (Component) => {

            return class View extends React.Component {

                state = {
                    props: null
                }

                componentDidMount() {
                    this.reload()
                }

                render() {

                    if (!this.state.props) {
                        return (
                            <Loader
                                message="Loading"
                            />
                        )
                    }

                    return (
                        <Component {...this.props} {...this.state.props} reload={this.reload}/>
                    )
                }

                reload = () => {

                    const promises = map(mapQueriesToProps(this.props), (resolver, key) => resolver.then(value => ({
                        key,
                        value
                    })))

                    Promise.all(promises).then(results => {

                        this.setState({
                            props: reduce(results, (result, entry) => {
                                result[entry.key] = entry.value
                                return result
                            }, extend({}, mapMutationsToProps))
                        })
                    })
                }
            }
        }
    }
}