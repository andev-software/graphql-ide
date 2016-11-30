import TypeRegistry from "./typeRegistry"
import resolveScalarType from "./resolveScalarType"
import createEnumType from "./createEnumType"
import createField from "./createField"
import createInputField from "./createInputField"
import createInputObjectType from "./createInputObjectType"
import createObjectType from "./createObjectType"
import createUnionType from "./createUnionType"
import {GraphQLSchema, GraphQLList, GraphQLNonNull} from "graphql"

export default (schema) => {

    const typeRegistry = new TypeRegistry

    function resolveType(typename, nonNull, isList, nonNullListValue) {

        let result = resolveScalarType(typename)

        if (!result) {
            result = typeRegistry.resolve(typename)
        }

        if (isList) {

            if (nonNullListValue) {
                result = new GraphQLNonNull(result)
            }

            result = new GraphQLList(result)
        }

        if (nonNull) {
            result = new GraphQLNonNull(result)
        }

        return result
    }

    schema.enumTypes.forEach(enumType => {
        typeRegistry.register(enumType.name, createEnumType(enumType))
    })

    schema.inputObjectTypes.forEach(inputObjectType => {
        typeRegistry.register(inputObjectType.name, createInputObjectType(resolveType, inputObjectType, createInputField))
    })

    schema.objectTypes.forEach(objectType => {
        typeRegistry.register(objectType.name, createObjectType(resolveType, objectType, createField))
    })

    schema.unionTypes.forEach(unionType => {
        typeRegistry.register(unionType.name, createUnionType(resolveType, unionType))
    })

    const schemaFields = {}

    const Query = schema.objectTypes.find(type => type.name === 'Query')
    const Mutation = schema.objectTypes.find(type => type.name === 'Mutation')

    if (Query && Query.fields.length > 0) {
        schemaFields.query = resolveType('Query')
    }

    if (Mutation && Mutation.fields.length > 0) {
        schemaFields.mutation = resolveType('Mutation')
    }

    return new GraphQLSchema(schemaFields)
}