import GraphqlJSTransport from 'lokka-transport-graphql-js'
import {Lokka} from "lokka"

export default (schema) => {

    return new Lokka({
        transport: new GraphqlJSTransport(schema)
    })
}