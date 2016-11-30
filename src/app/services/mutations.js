import {fromJS} from "immutable"

export default (graphql, fragments) => {

    function createQueryTab(variables) {

        return graphql.mutate(`
             ($input: CreateQueryTabInput!) {
                    createQueryTab(input:$input) {
                        id
                    }
             }
        `, variables)
            .then(fromJS)
            .then(r => r.get('createQueryTab'))
    }

    function createProject({data}) {

        return graphql.mutate(`
             ($input: CreateProjectInput!) {
                    createProject(input:$input)
             }
        `, {
            input: data
        })
    }

    function updateProject({data}) {

        return graphql.mutate(`
             ($input: UpdateProjectInput!) {
                    updateProject(input:$input)
             }
        `, {
            input: data
        })
    }

    function removeProject({id}) {

        return graphql.mutate(`
             ($id: ID!) {
                    removeProject(id:$id)
             }
        `, {
            id: id
        })
    }

    return {
        createProject,
        createQueryTab
    }
}