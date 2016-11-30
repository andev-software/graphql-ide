export default (resolvers) => {

    return {
        name: 'Viewer',
        fields: [{
            name: 'allProjects',
            type: 'Project',
            isList: true,
            resolvers: [
                resolvers.allProjects
            ]
        }, {
            name: 'findProject',
            type: 'Project',
            args: [{
                name: 'id',
                type: 'ID',
                nonNull: true
            }],
            resolvers: [
                resolvers.findProject
            ]
        }]
    }
}