export default () => {

    function findProject(state, {id}) {
        return state.getIn(['dataStore', 'projectsById', id])
    }

    function allProjects(state) {
        return state.getIn(['dataStore', 'projects'])
            .map(id => {

                const project = findProject(state, {id})

                return project
            })
    }

    return {
        allProjects,
        findProject
    }
}