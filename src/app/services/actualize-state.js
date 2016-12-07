import {Map} from "immutable"

export default () => {

    return (state) => {

        const version = state.getIn(['app', 'version'])

        if (version && version === "1.0") {

            state = state.setIn(['app', 'version'], "1.1")

            state = state.updateIn(['dataStore', 'environmentsById'], environments => {
                return environments.map(environment => {
                    if (!environment.has('headers')) {
                        return environment.set('headers', Map())
                    }
                    return environment
                })
            })
        }

        return state
    }
}