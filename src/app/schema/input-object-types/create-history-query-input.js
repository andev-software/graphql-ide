export default () => {

    return {
        name: 'CreateHistoryQueryInput',
        fields: [{
            name: 'operationType',
            type: 'String'
        }, {
            name: 'operationName',
            type: 'String'
        }, {
            name: 'query',
            type: 'String'
        }, {
            name: 'variables',
            type: 'String'
        }, {
            name: 'response',
            type: 'String'
        }, {
            name: 'duration',
            type: 'Int'
        }]
    }
}