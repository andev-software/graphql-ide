export default function connectionFromPromisedArray(promise) {
    return promise.then(results => {
        return {
            edges: results.map(node => {
                return ({
                    node
                })
            })
        }
    })
}