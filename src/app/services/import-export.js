import moment from "moment"
import fs from "fs"
import electron from "electron"
const {remote} = electron
import concat from "lodash/concat"
import uuid from "uuid"
import promisify from "es6-promisify"
import {Map, List, fromJS} from "immutable"
import replace from "lodash/replace"

const errorPad = fn => (input, cb) => {
    fn(input, (value) => cb(null, value))
}
const showSaveDialog = promisify(errorPad(remote.dialog.showSaveDialog))
const showOpenDialog = promisify(errorPad(remote.dialog.showOpenDialog))
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

function parseJSON(input) {

    try {
        return JSON.parse(input)
    } catch (e) {
        return null
    }
}

export default ({store, config, factories}) => {

    async function processImport(data) {

        data = data.dataStore

        // Gather all id's
        const ids = concat(
            data.projects,
            data.environments,
            data.queries
        )

        // Replace all id instances with new ones
        // to prevent conflicting data
        let source = JSON.stringify(data)

        ids.forEach(id => {
            source = replace(source, new RegExp(id, "g"), uuid.v4())
        })

        data = JSON.parse(source)

        data = fromJS(data)

        data = data.update('projectsById', projects => {
            return projects.map(project => {
                return factories.createProject().merge(project)
            })
        })

        data = data.update('environmentsById', environments => {
            return environments.map(environment => {
                return factories.createEnvironment().merge(environment)
            })
        })

        data = data.update('queriesById', queries => {
            return queries.map(query => {
                return factories.createQuery().merge(query)
            })
        })

        store.dispatch({
            type: 'IMPORT',
            payload: data
        })
    }

    async function importProject() {

        const downloadsPath = remote.app.getPath('downloads')

        const filepaths = await showOpenDialog({
            defaultPath: downloadsPath,
            filters: [{
                name: 'JSON',
                extensions: ['json']
            }]
        })

        // User canceled the selection
        if (!filepaths) {
            return
        }

        return await Promise.all(filepaths.map(filepath => {
            return readFile(filepath, 'utf-8')
                .then(parseJSON)
                .then(processImport)
        }))
    }

    async function exportProject({projectId}) {

        const filename = 'graphql_ide_project_' + moment().format('DD-MM-YYYY_HH-mm') + '.json'
        const downloadsPath = remote.app.getPath('downloads')

        const filePath = await showSaveDialog({
            defaultPath: downloadsPath + '/' + filename,
            filters: [{
                name: 'JSON',
                extensions: ['json']
            }]
        })

        const state = store.getState()

        let data = Map({
            app: Map({
                version: config.get('version')
            }),
            dataStore: Map({
                projectsById: Map(),
                projects: List(),
                environmentsById: Map(),
                environments: List(),
                queriesById: Map(),
                queries: List()
            })
        })

        const project = state.getIn(['dataStore', 'projectsById', projectId])

        if (!project) {
            swal("Error", "Could not export project", "error")
            return
        }

        data = data.setIn(['dataStore', 'projectsById', projectId], Map({
            id: project.get('id'),
            title: project.get('title'),
            description: project.get('description'),
            activeEnvironmentId: project.get('activeEnvironmentId'),
            environmentIds: project.get('environmentIds'),
            collectionQueryIds: project.get('collectionQueryIds'),
            headers: project.get('headers'),
        }))

        data = data.updateIn(['dataStore', 'projects'], projects => {
            return projects.push(project.get('id'))
        })

        project.get('environmentIds').forEach(id => {

            const environment = state.getIn(['dataStore', 'environmentsById', id])

            data = data.setIn(['dataStore', 'environmentsById', id], Map({
                id: environment.get('id'),
                title: environment.get('title'),
                url: environment.get('url'),
                queryMethod: environment.get('queryMethod'),
                variables: environment.get('variables')
            }))

            data = data.updateIn(['dataStore', 'environments'], environments => {
                return environments.push(id)
            })
        })

        project.get('collectionQueryIds').forEach(id => {

            const query = state.getIn(['dataStore', 'queriesById', id])

            data = data.setIn(['dataStore', 'queriesById', id], Map({
                id: query.get('id'),
                type: query.get('type'),
                operationName: query.get('operationName'),
                operationType: query.get('operationType'),
                query: query.get('query'),
                variables: query.get('variables'),
                headers: query.get('headers'),
                updatedAt: query.get('updatedAt'),
                createdAt: query.get('createdAt')
            }))

            data = data.updateIn(['dataStore', 'queries'], queries => {
                return queries.push(id)
            })
        })

        data = JSON.stringify(data, null, 4)

        if (filePath) {
            return await writeFile(filePath, data)
        }
    }

    return {
        exportProject,
        importProject
    }
}