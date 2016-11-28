import {List} from "immutable"

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

        return project.merge({
            source: project,
            selectedTab: tab ? tab : project.get('tabs').last(),
            selectedEnvironment: env ? env : project.getIn(['environments', 0]),
            collectionQueries: List(),
            historyQueries: List()
        })
    }

    function readQuery() {

        // shortname: (item.operationType || "").substring(0, 2),
        //     title: item.title || "<Unnamed>",
        //     meta: moment(item.createdAt).from(moment()),
        //     subMeta: item.duration ? `${item.duration}ms` : null
    }

    function readTab(tab) {

        return tab.merge({

        })
    }

    return {
        allProjects,
        findProject,
        readProject
    }
}