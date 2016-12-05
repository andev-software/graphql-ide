import get from "lodash/get"

export default function getOperationName(queryFacts) {
    return get(queryFacts, 'operations[0].name.value')
}