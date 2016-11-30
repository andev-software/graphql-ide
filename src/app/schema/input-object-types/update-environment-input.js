export default () => {

    return {
        name: 'UpdateEnvironmentInput',
        fields: [{
            name: 'id',
            type: 'ID'
        }, {
            name: 'name',
            type: 'String'
        }, {
            name: 'url',
            type: 'String'
        }, {
            name: 'variables',
            type: 'String'
        }, {
            name: 'isDefault',
            type: 'Boolean'
        }]
    }
}