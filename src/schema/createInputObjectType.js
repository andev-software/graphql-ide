import {GraphQLInputObjectType} from "graphql"

export default function createInputObjectType(resolveType, inputObjectType, createInputField) {

    const {fields} = inputObjectType

    if (!fields) {
        throw `no fields '${inputObjectType.name}'`
    }

    return new GraphQLInputObjectType({
        name: inputObjectType.name,
        description: inputObjectType.description,
        fields: () => fields.reduce((result, field) => {

            const name = field.name

            if (!field.type) {
                throw `Input Object (${inputObjectType.name}) Input Field (${field.name}) has no type`
            }

            result[name] = createInputField(resolveType, field)

            return result

        }, {})
    })
}