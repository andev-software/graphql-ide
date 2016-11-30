export default () => {

    return {
        name: 'UpdateSavedQueryInput',
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
        }]
    }
}