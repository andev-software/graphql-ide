import {buildClientSchema} from 'graphql'
import moment from "moment"

export default () => {

    function allProjects(state) {
        return state.getIn(['entities', 'projects']).map(projectId => state.getIn(['entities', 'projectsById', projectId]))
    }

    function findProject(state, {projectId}) {
        const project = state.getIn(['entities', 'projectsById', projectId])
        return project ? readProject(project) : null
    }

    function readProject(project) {

        const tab = project.get('tabs').find(tab => tab.get('id') === project.get('selectedTabId'))
        const env = project.get('environments').find(env => env.get('id') === project.get('selectedEnvironmentId'))

        const tabs = project.get('tabs').map(tab => tab.merge({
            title: tab.getIn(['request', 'operationName']) || "<Unnamed>"
        }))

        return project.merge({
            source: project,
            selectedTab: tab ? tab : tabs.last(),
            selectedEnvironment: env ? env : project.getIn(['environments', 0]),
            requestHistory: project.get('requestHistory').map(readRequest).sort(sortRequest),
            requestCollection: project.get('requestCollection').map(readRequest).sort(sortRequest),
            tabs
        })
    }

    function sortRequest(a, b) {
        return b.get('createdAt').localeCompare(a.get('createdAt'))
    }

    function readRequest(request) {

        return request.merge({
            shortname: (request.get('operationType') || "").substring(0, 2),
            title: request.get('operationName') || "<Unnamed>",
            meta: moment(request.get('createdAt')).from(moment()),
            subMeta: request.get('duration') ? `${request.get('duration')}ms` : null
        })
    }

    function environmentSchema(environment) {

        let schema = null

        if (environment.hasIn(['schema', 'response'])) {
            const schemaResponse = JSON.parse(environment.getIn(['schema', 'response']))
            schema = buildClientSchema(schemaResponse.data)
        }

        return schema
    }

    function transformProject(project) {

        return project
            .update('environments', environments => {
                return environments.map(environment => {
                    return environment.update('schema', schema => {
                        return schema ? buildClientSchema(JSON.parse(schema)) : null
                    })
                })
            })
    }

    return {
        environmentSchema,
        allProjects,
        findProject,
        readProject,
        transformProject
    }
}