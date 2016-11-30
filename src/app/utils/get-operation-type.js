import getQueryFacts from "graphiql/dist/utility/getQueryFacts"

export default (schema, query) => {

    const queryFacts = getQueryFacts(schema, query)

    if (!queryFacts.operations) {
        return null
    }

    return queryFacts.operations[0] ? queryFacts.operations[0].operation : null
}