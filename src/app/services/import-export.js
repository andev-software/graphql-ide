import moment from "moment"
import fs from "fs"
import electron from "electron"
const {remote} = electron
import getDefined from "app/utils/get-defined"

export default (mutations, queries) => {

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

    function saveFile(filePath, data) {

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

    async function exportProject({projectId}) {

        const project = await queries.findProject({projectId})

        project.queries = await queries.findProjectQueries({
            projectId,
            type: 'COLLECTION'
        })

        const filePath = await promptSaveDialog()

        if (filePath) {
            return await saveFile(filePath, {
                project
            })
        }
    }

    return {
        exportProject,
        importProject
    }
}