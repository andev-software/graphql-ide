export default () => {

    return {
        name: 'SavedQuery',
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
            name: 'updatedAt',
            type: 'DateTime'
        }, {
            name: 'createdAt',
            type: 'DateTime'
        }]
    }
}