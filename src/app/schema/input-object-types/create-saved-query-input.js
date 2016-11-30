export default () => {

    return {
        name: 'CreateSavedQueryInput',
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
        }]
    }
}