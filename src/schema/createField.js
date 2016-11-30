import intersection from "lodash/intersection"

function createResolveFn(resolvers, fieldContext) {

    return (source, args, context, info) => {

        return resolvers.reduce((prevPromise, resolverFn) => {
            return prevPromise.then(source => {
                return resolverFn(source, args, context, info, fieldContext)
            })
        }, Promise.resolve(source))
    }
}

/**
 * If a resolve function is not given, then a default resolve behavior is used
 * which takes the property of the source object of the same name as the field
 * and returns it as the result, or if it's a function, returns the result
 * of calling that function while passing along args and context.
 */
function defaultResolveFn(source, args, context, { fieldName }) {
    // ensure source is a value for which property access is acceptable.
    if (typeof source === 'object' || typeof source === 'function') {
        const property = source[fieldName]
        if (typeof property === 'function') {
            return source[fieldName](args, context)
        }
        return property
    }
}

function authorizationResolver(source, args, context, info, field) {

    const userScopes = context.scopes
    const fieldScopes = field.scopes
    const matches = intersection(userScopes, fieldScopes)

    if (!matches.length) {
        throw new Error('Access denied.')
    }

    return source
}

export default function createField(resolveType, field) {

    const {
        name,
        description
    } = field

    if (!field.type) {
        throw `Field with name: '${name}' has no type`
    }

    let resolvers = field.resolvers || []

    let args = null

    if (field.args && field.args.length > 0) {

        args = field.args.reduce((result, arg) => {

            const name = arg.name

            result[name] = {
                name: name,
                type: resolveType(arg.type, arg.nonNull, arg.isList, arg.nonNullListValue)
            }

            return result

        }, {})
    }

    const defaultResolvers = [
        // authorizationResolver
    ]

    if (!resolvers.length > 0) {
        defaultResolvers.push(defaultResolveFn)
    }

    resolvers = defaultResolvers.concat(resolvers)

    return {
        name,
        description,
        args,
        type: resolveType(field.type, field.nonNull, field.isList, field.nonNullListValue),
        resolve: createResolveFn(resolvers, field)

    }
}