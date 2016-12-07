import omitBy from "lodash/omitBy"
import isEmpty from "lodash/isEmpty"
import isNil from "lodash/isNil"
import merge from "lodash/merge"
import querystring from "querystring"
import {introspectionQuery} from "graphql"

export default (db) => {

    function fetchSchema({url, method, headers}) {

        return fetchQuery({
            url,
            method,
            headers,
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

    return {
        fetchSchema,
        fetchQuery
    }
}