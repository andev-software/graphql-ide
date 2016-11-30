import Knex from "knex"

export default () => {

    const db = Knex({
        client: 'mysql',
        connection: {
            host: '127.0.0.1',
            user: 'root',
            password: 'root',
            database: 'graphql_ide',
            timezone: 'UTC'
        }
    })
    return db
}
