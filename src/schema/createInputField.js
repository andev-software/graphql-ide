export default function createInputField(resolveType, field) {

    const {
        name,
        description,
        defaultValue
    } = field

    return {
        name,
        description,
        defaultValue,
        type: resolveType(field.type, field.nonNull, field.isList, field.nonNullListValue)
    }
}