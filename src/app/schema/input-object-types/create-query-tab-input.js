export default () => {

    return {
        name: 'CreateQueryTabInput',
        fields: [{
            name: 'projectId',
            type: 'ID',
            nonNull: true
        }, {
            name: 'type',
            type: 'QueryTabType'
        }]
    }
}