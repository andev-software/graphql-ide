import {GraphQLError} from 'graphql/error'
import {GraphQLScalarType} from 'graphql'
import {Kind} from 'graphql/language'
import moment from 'moment'

function dateTimeParser(ast) {

    if (ast.kind !== Kind.STRING) {
        throw new GraphQLError('Query error: Can only parse strings got a: ' + ast.kind, [ast])
    }

    const date = moment(ast.value)

    if (!date.isValid()) {
        throw new GraphQLError('Query error: String is not a valid date time string', [ast])
    }

    return date.toDate()
}

export const GraphQLDateTimeType = new GraphQLScalarType({
    name: 'DateTime',
    description: 'The DateTime scalar type represents date time strings complying to ISO-8601.',
    serialize: value => value ? value.toISOString() : null,
    parseValue: value => {
        return dateTimeParser({
            kind: Kind.STRING,
            value
        })
    },
    parseLiteral: ast => {
        return dateTimeParser(ast)
    }
})

function identity(value) {
    return value
}

function parseLiteral(ast) {
    switch (ast.kind) {
        case Kind.STRING:
        case Kind.BOOLEAN:
            return ast.value
        case Kind.INT:
        case Kind.FLOAT:
            return parseFloat(ast.value)
        case Kind.OBJECT: {
            const value = Object.create(null)
            ast.fields.forEach(field => {
                value[field.name.value] = parseLiteral(field.value)
            })

            return value
        }
        case Kind.LIST:
            return ast.values.map(parseLiteral)
        default:
            return null
    }
}

export const GraphQLJSONType = new GraphQLScalarType({
    name: 'JSON',
    description: 'The `JSON` scalar type represents JSON values as specified by ' +
    '[ECMA-404](http://www.ecma-international.org/' +
    'publications/files/ECMA-ST/ECMA-404.pdf).',
    serialize: identity,
    parseValue: identity,
    parseLiteral,
})