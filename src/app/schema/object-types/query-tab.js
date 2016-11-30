export default (resolvers) => {

    return {
        name: 'QueryTab',
        fields: [{
            name: 'id',
            type: 'ID'
        }, {
            name: 'type',
            type: 'QueryTabType'
        }, {
            name: 'queryId',
            type: 'ID'
        }, {
            name: 'query',
            type: 'ProjectQuery'
        }]
    }
}