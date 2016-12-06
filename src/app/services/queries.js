import omitBy from "lodash/omitBy"
import isEmpty from "lodash/isEmpty"
import isNil from "lodash/isNil"
import merge from "lodash/merge"
import querystring from "querystring"
import {introspectionQuery} from "graphql"

export default (db) => {

    function fetchSchema({url, method}) {

        return fetchQuery({
            url,
            method,
            params: {
                query: introspectionQuery
            }
        })
    }

    function fetchQuery({params, url, method, headers}) {

        params = omitBy(params, isNil)
        params = omitBy(params, isEmpty)

        let options = {
            method,
            credentials: 'include'
        }

        if (method == "GET") {

            options.headers = merge({}, headers)

            url += url.indexOf('?') == -1 ? "?" : "&"

            url += querystring.stringify(params)
        }

        else {

            options.headers = merge({
                'content-type': 'application/json'
            }, headers)

            options.body = JSON.stringify(params)
        }

        return fetch(url, options)
            .then(res => res.text())
            .then(res => {

                try {
                    return JSON.parse(res)
                } catch (e) {
                    return {
                        data: null,
                        errors: [{
                            message: res
                        }]
                    }
                }
            })
    }

    function allProjects() {

        return new Promise((resolve, reject) => {

            db.projects.find({}).sort({updatedAt: -1}).exec((err, results) => {

                if (err) {
                    reject(err)
                    return
                }

                resolve(results)
            })
        })
    }

    function findProject({projectId}) {

        return new Promise((resolve, reject) => {

            db.projects.findOne({_id: projectId}, {}, (err, result) => {

                if (err) {
                    reject(err)
                    return
                }

                resolve(result)
            })
        })
    }

    function findProjectQueries({projectId, type}) {

        return new Promise((resolve, reject) => {

            db.queries.find({projectId: projectId, type: type}).sort({createdAt: -1}).exec((err, results) => {

                if (err) {
                    reject(err)
                    return
                }

                resolve(results)
            })
        })
    }

    function findQuery({queryId}) {

        return new Promise((resolve, reject) => {

            db.queries.findOne({_id: queryId}, {}, (err, result) => {

                if (err) {
                    reject(err)
                    return
                }

                resolve(result)
            })
        })
    }

    return {
        fetchSchema,
        fetchQuery,
        allProjects,
        findProject,
        findProjectQueries,
        findQuery
    }
}