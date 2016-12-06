import get from "lodash/get"

export default function getOperationType(queryFacts) {
    return get(queryFacts, 'operations[0].operation')
}