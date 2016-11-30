import {GraphQLEnumType} from "graphql"

export default function createEnumType(enumType) {

    const {
        name,
        description,
    } = enumType

    if (!enumType.values) {
        throw `EnumType ${name} has no values`
    }

    const values = enumType.values.reduce((result, enumValue) => {

        let {value} = enumValue

        const {
            name,
            description
        } = enumValue

        const numberExp = new RegExp(/^\d+$/)

        if (numberExp.test(value)) {
            value = parseInt(value)
        }

        result[name] = {
            value,
            description
        }

        return result

    }, {})

    return new GraphQLEnumType({
        name,
        description,
        values
    })
}