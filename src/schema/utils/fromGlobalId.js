export function unbase64(i) {
    return ((new Buffer(i, 'base64')).toString('utf8'))
}


/**
 * Takes the "global ID" created by toGlobalID, and returns the type name and ID
 * used to create it.
 */
export default function fromGlobalId(globalId) {
    var unbasedGlobalId = unbase64(globalId)
    var delimiterPos = unbasedGlobalId.indexOf(':')
    return {
        type: unbasedGlobalId.substring(0, delimiterPos),
        id: unbasedGlobalId.substring(delimiterPos + 1)
    }
}