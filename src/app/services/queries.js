import {fromJS} from "immutable"

export default (graphql, fragments) => {

    function allProjects() {

        return graphql.query(`
            query {
                viewer {
                    allProjects {
                        ...${fragments.project}
                    }
                }
            }
        `)
            .then(r => fromJS(r))
            .then(r => r.getIn(['viewer', 'allProjects']))
    }

    function findProject(variables) {

        return graphql.query(`
            query {
                viewer {
                    findProject(id: ${variables.id}) {
                        id
                        title
                        selectedTab {
                            ...${fragments.queryTab}
                            query {
                                ...${fragments.fullHistoryQuery}
                                ...${fragments.fullSavedQuery}
                            }
                        }
                        queryTabs {
                            ...${fragments.queryTab}
                            query {
                                ...${fragments.historyQuery}
                                ...${fragments.savedQuery}
                            }
                        }
                        environments {
                            ...${fragments.environment}
                        }
                        historyQueries {
                            ...${fragments.historyQuery}
                        }
                        savedQueries {
                            ...${fragments.savedQuery}
                        }
                    }
                }
            }
        `)
            .then(fromJS)
            .then(r => r.getIn(['viewer', 'findProject']))
    }

    return {
        allProjects,
        findProject
    }
}