import cloneDeep from "lodash/cloneDeep"
import forEach from "lodash/forEach"
import isNil from "lodash/isNil"

export default function mapInput(input, fields) {

    // Ensure immutable input
    input = cloneDeep(input)

    forEach(fields, (mapFn, name) => {
        if (!isNil(input[name])) {
            input[name] = mapFn(input[name])
        }
    })

    return input
}