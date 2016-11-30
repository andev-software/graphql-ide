export default () => {

    return {
        name: 'CreateEnvironmentInput',
        fields: [{
            name: 'name',
            type: 'String'
        }, {
            name: 'url',
            type: 'String'
        }, {
            name: 'isDefault',
            type: 'Boolean'
        }]
    }
}