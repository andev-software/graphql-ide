export default (resolvers) => {

    return {
        name: 'Environment',
        fields: [{
            name: 'id',
            type: 'ID'
        }, {
            name: 'title',
            type: 'String'
        }, {
            name: 'url',
            type: 'String'
        }, {
            name: 'variables',
            type: 'String'
        }, {
            name: 'schema',
            type: 'String',
            resolvers: [
                resolvers.environmentSchema
            ]
        }, {
            name: 'isDefault',
            type: 'Boolean'
        }, {
            name: 'updatedAt',
            type: 'DateTime'
        }]
    }
}