export default (graphql) => {

    return {
        queryTab: graphql.createFragment(`
            fragment on QueryTab {
                id
                queryId
                type
            }
        `),
        historyQuery: graphql.createFragment(`
            fragment on HistoryQuery {
                id
                operationType
                operationName
                query
                variables
                response
                duration
            }
        `),
        savedQuery: graphql.createFragment(`
            fragment on SavedQuery {
                id
                operationType
                operationName
                query
                variables 
            }
        `),
        project: graphql.createFragment(`
            fragment on Project {
                id
                title
                topPane
                leftPane
                rightPane
                updatedAt
                createdAt
            }
        `),
        environment: graphql.createFragment(`
            fragment on Environment {
                id
                title
                schema
                isDefault
                url
            }
        `),
        fullHistoryQuery: graphql.createFragment(`
            fragment on HistoryQuery {
                id
                operationType
                operationName
                query
                variables
                response
                duration
                createdAt
            }
        `),
        historyQuery: graphql.createFragment(`
            fragment on HistoryQuery {
                id
                operationType
                operationName
            }
        `),
        fullSavedQuery: graphql.createFragment(`
            fragment on HistoryQuery {
                id
                operationType
                operationName
                query
                variables
            }
        `),
        savedQuery: graphql.createFragment(`
            fragment on SavedQuery {
                id
                operationType
                operationName
            }
        `)
    }
}