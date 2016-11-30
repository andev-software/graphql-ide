import isUndefined from "lodash/isUndefined"
import {Map} from "immutable"
import {GraphQLUnionType} from "graphql"

export default function createUnionType(resolveType, unionType) {

    const {
        name,
        description,
        types
    } = unionType

    const resolveableTypes = types.reduce((result, type) => {
        return result.set(type.name, resolveType(type.name))
    }, Map())

    function resolveTypeFn(data) {

        if (isUndefined(data.__typename) === false) {

            const type = resolveableTypes.get(data.__typename)

            if (type) {
                return type
            }
        }

        return null
    }

    return new GraphQLUnionType({
        name,
        description,
        types: types.map(type => resolveType(type.name)),
        resolveType: resolveTypeFn
    })
}