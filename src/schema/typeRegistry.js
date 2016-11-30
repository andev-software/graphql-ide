import {Map} from "immutable"

export default class TypeRegistry {

    constructor() {
        this.cache = Map()
    }

    register(name, type) {
        this.cache = this.cache.set(name, type)
    }

    resolve(name) {
        const type = this.cache.get(name)

        if (!type) {
            throw `Could not find type with name: '${name}'`
        }

        return type
    }
}