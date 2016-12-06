import {List, Map} from "immutable"
import camelCase from "camel-case"
import set from "lodash/set"

export default class DataStore {

    constructor() {
        this.collections = Map()
    }

    collection(collection) {
        this.collections = this.collections.set(collection.name, collection)
        return this
    }

    getInitialState() {

        return this.collections.reduce((result, collection) => {

            return result
                .set(`${collection.name}ById`, Map())
                .set(`${collection.name}`, List())

        }, Map())
    }

    getActions() {

        return this.collections.reduce((result, collection) => {

            collection.actions.forEach((handler, action) => {
                result = result.set(action, handler)
            })

            return result
        }, Map())
    }

    getActionCreators() {

        return this.collections.reduce((result, collection) => {

            collection.actions.forEach((handler, action) => {
                set(result, [collection.name, camelCase(action)], payload => ({
                    type: action,
                    payload
                }))
            })

            return result
        }, {})
    }

    getFlatActionCreators() {

        const actions = this.getActions()

        return actions.reduce((result, handler, type) => {

            const name = camelCase(type)

            result[name] = (payload) => {

                return {
                    type,
                    payload
                }
            }
            return result
        }, {})
    }
}