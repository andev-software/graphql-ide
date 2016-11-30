export default () => {

    return {
        name: 'UpdateProjectInput',
        fields: [{
            name: 'id',
            type: 'ID'
        }, {
            name: 'name',
            type: 'String'
        }, {
            name: 'topPane',
            type: 'ProjectTopPane'
        }, {
            name: 'rightPane',
            type: 'ProjectRightPane'
        }, {
            name: 'leftPane',
            type: 'ProjectLeftPane'
        }]
    }
}