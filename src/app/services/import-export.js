import moment from "moment"
import fs from "fs"
import electron from "electron"
const {remote} = electron
import getDefined from "app/utils/get-defined"
import uuid from "uuid"
import {Map, List} from "immutable"

export default (mutations, queries) => {

    function importProject() {

        function promptChooseFile() {

            const downloadsPath = remote.app.getPath('downloads')

            return new Promise((resolve, reject) => {

                remote.dialog.showOpenDialog({
                    defaultPath: downloadsPath,
                    filters: [{
                        name: 'JSON',
                        extensions: ['json']
                    }]
                }, (result) => {
                    resolve(result)
                })
            })
        }

        function readFile(filepath) {

            return new Promise((resolve, reject) => {

                fs.readFile(filepath, 'utf-8', (err, result) => {

                    if (err) {
                        reject(err)
                        return
                    }

                    resolve(result)
                })
            })
        }

        function readEndpoint(endpoint) {
            return getDefined(endpoint, [
                'id',
                'title',
                'url',
                'isDefault'
            ])
        }

        function readProject(project) {

            const result = getDefined(project, [
                'title',
                'description',
                'variables',
                'settings'
            ])

            result.endpoints = project.endpoints.map(readEndpoint)
            return result
        }

        function readQuery(query) {

            return getDefined(query, [
                'title',
                'method',
                'type',
                'createdAt',
                'endpointId',
                'operationName',
                'query',
                'variables',
                'headers',
                'duration',
                'operationType'
            ])
        }

        function processImportData(data) {

            return mutations.createProject({
                input: readProject(data.project)
            })
                .then(project => {

                    const promises = data.project.queries.map(query => {

                        query = readQuery(query)

                        return mutations.createQuery({
                            projectId: project._id,
                            input: query
                        })
                    })

                    return Promise.all(promises)
                })
        }

        return promptChooseFile()
            .then(filepaths => {

                return Promise.all(filepaths.map(filepath => {

                    return readFile(filepath)
                        .then(data => JSON.parse(data))
                        .then(data => processImportData(data))
                }))
            })
    }

    function exportProject({projectId}) {

        let output = {}

        function processProject(projectId) {
            return queries.findProject({projectId}).then((project) => {
                output.project = project
            })
        }

        function processQueries(projectId) {
            return queries.findProjectQueries({
                projectId,
                type: 'COLLECTION'
            }).then(queries => {
                output.project.queries = queries
            })
        }

        function promptSaveDialog() {

            const filename = 'graphiql_project_' + moment().format('DD-MM-YYYY_HH-mm') + '.json'
            const downloadsPath = remote.app.getPath('downloads')

            return new Promise((resolve, reject) => {

                remote.dialog.showSaveDialog({
                    defaultPath: downloadsPath + '/' + filename,
                    filters: [{
                        name: 'JSON',
                        extensions: ['json']
                    }]
                }, (result) => {
                    resolve(result)
                })
            })
        }

        function saveFile(filePath) {

            return new Promise((resolve, reject) => {

                const data = JSON.stringify(output, null, 4)

                fs.writeFile(filePath, data, (err, result) => {

                    if (err) {
                        reject(err)
                        return
                    }

                    resolve(result)
                })
            })
        }

        return processProject(projectId)
            .then(() => processQueries(projectId))
            .then(promptSaveDialog)
            .then(filePath => {

                if (filePath) {
                    return saveFile(filePath)
                }
            })
    }

    function exportVersionOneProject({projectId}) {

        const projectUUID = uuid.v4()

        let data = Map({
            app: Map({
                version: "0.2"
            }),
            dataStore: Map({
                projectsById: Map(),
                projects: List([
                    projectUUID
                ]),
                environmentsById: Map(),
                environments: List(),
                queriesById: Map(),
                queries: List()
            })
        })

        function processEndpoints(endpoints) {

            const environmentIds = endpoints.map(endpoint => {

                const environmentId = uuid.v4()

                data = data.setIn(['dataStore', 'environmentsById', environmentId], Map({
                    id: environmentId,
                    title: endpoint.title,
                    url: endpoint.url,
                    queryMethod: 'POST',
                    variables: Map()
                }))

                return environmentId
            })

            data = data.setIn(['dataStore', 'environments'], environmentIds)

            data = data.updateIn(['dataStore', 'projectsById', projectUUID], project => {
                return project
                    .set('activeEnvironmentId', environmentIds[0])
                    .set('environmentIds', environmentIds)
            })
        }

        function processProject() {
            return queries.findProject({projectId}).then((project) => {

                data = data.setIn(['dataStore', 'projectsById', projectUUID], Map({
                    id: projectUUID,
                    title: project.title,
                    description: project.description,
                    activeEnvironmentId: null,
                    environmentIds: List(),
                    collectionQueryIds: List(),
                    headers: Map()
                }))

                processEndpoints(project.endpoints)
            })
        }

        function processQueries() {
            return queries.findProjectQueries({
                projectId,
                type: 'COLLECTION'
            }).then(queries => {

                const queryIds = queries.map(query => {

                    let headers = Map()

                    query.headers.forEach(header => {
                        headers = headers.set(header.key, header.value)
                    })

                    const queryId = uuid.v4()
                    data = data.setIn(['dataStore', 'queriesById', queryId], Map({
                        id: queryId,
                        operationName: query.operationName,
                        operationType: query.operationType,
                        headers: headers,
                        query: query.query,
                        updatedAt: query.updatedAt,
                        createdAt: query.createdAt,
                        variables: JSON.stringify(query.variables),
                        type: query.type
                    }))

                    return queryId
                })

                data = data.setIn(['dataStore', 'queries'], queryIds)

                data = data.updateIn(['dataStore', 'projectsById', projectUUID], project => {
                    return project.set('collectionQueryIds', queryIds)
                })
            })
        }

        function promptSaveDialog() {

            const filename = 'graphiql_project_' + moment().format('DD-MM-YYYY_HH-mm') + '.json'
            const downloadsPath = remote.app.getPath('downloads')

            return new Promise((resolve, reject) => {

                remote.dialog.showSaveDialog({
                    defaultPath: downloadsPath + '/' + filename,
                    filters: [{
                        name: 'JSON',
                        extensions: ['json']
                    }]
                }, (result) => {
                    resolve(result)
                })
            })
        }

        function saveFile(filePath) {

            return new Promise((resolve, reject) => {

                data = JSON.stringify(data, null, 4)

                fs.writeFile(filePath, data, (err, result) => {

                    if (err) {
                        reject(err)
                        return
                    }

                    resolve(result)
                })
            })
        }

        return processProject()
            .then(() => processQueries())
            .then(promptSaveDialog)
            .then(filePath => {

                if (filePath) {
                    return saveFile(filePath)
                }
            })
    }

    return {
        exportVersionOneProject,
        exportProject,
        importProject
    }
}