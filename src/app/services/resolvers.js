import getDefined from "app/utils/get-defined"
import {introspectionQuery} from "graphql"

export default (db) => {

    function allProjects() {

        return db.select('*')
            .from('projects')
            .orderBy('updatedAt', 'DESC')
    }

    function findProject(source, args) {

        return db.select('*')
            .from('projects')
            .where('id', args.id)
            .first()
    }

    function projectEnvironments(source) {

        return db.select('*')
            .from('environments')
            .where('projectId', source.id)
    }

    function projectHistoryQueries(source) {

        return db.select('*')
            .from('history_queries')
            .where('projectId', source.id)
    }

    function projectSavedQueries(source) {

        return db.select('*')
            .from('saved_queries')
            .where('projectId', source.id)
    }

    async function createEnvironment(source, args) {

        const id = await db('environments')
            .insert(args.input)
            .then(ids => ids[0])

        return await db
            .select('*')
            .from('environments')
            .where('id', id)
    }

    async function createHistoryQuery(source, args) {

        const id = await db('history_queries')
            .insert(args.input)
            .then(ids => ids[0])

        return await db
            .select('*')
            .from('history_queries')
            .where('id', id)
    }

    async function createProject(source, args) {

        const id = await db('projects')
            .insert(args.input)
            .then(ids => ids[0])

        return await db
            .select('*')
            .from('projects')
            .where('id', id)
    }

    async function createSavedQuery(source, args) {

        const id = await db('saved_queries')
            .insert(args.input)
            .then(ids => ids[0])

        return await db
            .select('*')
            .from('saved_queries')
            .where('id', id)
    }

    async function createQueryTab(source, args) {

        const id = await db('query_tabs')
            .insert(args.input)
            .then(ids => ids[0])

        return await db
            .select('*')
            .from('query_tabs')
            .where('id', id)
    }

    async function updateEnvironment(source, args) {

        const input = getDefined(args.input, [
            'title',
            'url',
            'variables',
            'schema',
            'isDefault'
        ])

        const id = await db('environments')
            .update(input)
            .then(ids => ids[0])

        return await db
            .select('*')
            .from('environments')
            .where('id', id)
    }

    async function updateProject(source, args) {

        const input = getDefined(args.input, [
            'title',
            'description'
        ])

        const id = await db('projects')
            .update(input)
            .then(ids => ids[0])

        return await db
            .select('*')
            .from('projects')
            .where('id', id)
    }

    async function updateSavedQuery(source, args) {

        const input = getDefined(args.input, [
            'operationType',
            'operationName',
            'query',
            'variables',
            'response'
        ])

        const id = await db('saved_queries')
            .update(input)
            .then(ids => ids[0])

        return await db
            .select('*')
            .from('saved_queries')
            .where('id', id)
    }

    function clearHistoryQueries(source, args) {

        return db('history_queries')
            .where('projectId', args.input.projectId)
            .del()
    }

    function removeSavedQuery(source, args) {

        return db('saved_queries')
            .where('id', args.id)
            .del()
    }

    function removeHistoryQuery(source, args) {

        return db('history_queries')
            .where('id', args.id)
            .del()
    }

    function removeEnvironment(source, args) {

        return db('environments')
            .where('id', args.id)
            .del()
    }

    function removeProject(source, args) {

        return db('projects')
            .where('id', args.id)
            .del()
    }

    function removeQueryTab(source, args) {

        return db('query_tabs')
            .where('id', args.id)
            .del()
    }

    async function environmentSchema(source) {

        try {

            await fetch(source.url, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    query: introspectionQuery
                })
            })
                .then(res => res.json())
                .then(res => JSON.stringify(res.data))

        } catch (e) {

        }
    }

    function projectQueryTabs(source) {

        return db.select('*')
            .from('query_tabs')
            .where('projectId', source.id)
    }

    return {
        allProjects,
        findProject,
        projectEnvironments,
        projectHistoryQueries,
        projectSavedQueries,
        createEnvironment,
        createHistoryQuery,
        createProject,
        createSavedQuery,
        createQueryTab,
        updateEnvironment,
        updateProject,
        updateSavedQuery,
        removeSavedQuery,
        removeHistoryQuery,
        removeEnvironment,
        removeProject,
        removeQueryTab,
        clearHistoryQueries,
        environmentSchema,
        projectQueryTabs
    }
}