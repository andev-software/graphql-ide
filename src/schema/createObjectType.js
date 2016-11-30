import {GraphQLObjectType} from "graphql"

export default function createObjectType(resolveType, objectType, createField) {

    return new GraphQLObjectType({
        name: objectType.name,
        description: objectType.description,
        fields: () => objectType.fields.reduce((result, field) => {

            field.objectType = objectType

            result[field.name] = createField(resolveType, field)

            return result
        }, {})
    })
}