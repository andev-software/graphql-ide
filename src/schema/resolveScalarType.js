import {GraphQLString, GraphQLID, GraphQLBoolean, GraphQLInt, GraphQLFloat} from "graphql"
import {GraphQLDateTimeType, GraphQLJSONType} from "./scalars"

export default function resolveScalarType(type) {

    switch (type) {
        case 'DateTime':
            return GraphQLDateTimeType
        case 'String':
            return GraphQLString
        case 'JSON':
            return GraphQLJSONType
        case 'Int':
            return GraphQLInt
        case 'Float':
            return GraphQLFloat
        case 'Boolean':
            return GraphQLBoolean
        case 'ID':
            return GraphQLID
        default:
            return null
    }
}