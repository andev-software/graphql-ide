import generateSchema from "schema/generateSchema"

export default (unionTypes, enumTypes, inputObjectTypes, objectTypes) => {

    return generateSchema({
        unionTypes,
        enumTypes,
        inputObjectTypes,
        objectTypes
    })
}