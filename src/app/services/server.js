import express from "express"
import graphQLHTTP from "express-graphql"
import http from "http"
import cors from "cors"

export default (schema) => {

    const app = express()

    app.use(cors({
        credentials: true,
        origin: true
    }))

    app.use('/graphql', graphQLHTTP({
        schema: schema,
        graphiql: true,
        pretty: true
    }))

    return http.createServer(app)
}