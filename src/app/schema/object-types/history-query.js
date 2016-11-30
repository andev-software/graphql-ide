export default () => {

    return {
        name: 'HistoryQuery',
        fields: [{
            name: 'id',
            type: 'ID'
        }, {
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
            name: 'duration',
            type: 'Int'
        }, {
            name: 'response',
            type: 'String'
        }, {
            name: 'createdAt',
            type: 'String'
        }]
    }
}