export default () => {

    return {
        name: 'Query',
        fields: [{
            name: 'viewer',
            type: 'Viewer',
            resolvers: [
                () => ({})
            ]
        }]
    }
}