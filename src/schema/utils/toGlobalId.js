export function base64(i) {
    return ((new Buffer(i, 'utf8')).toString('base64'))
}

/**
 * Takes a type name and an ID specific to that type name, and returns a
 * "global ID" that is unique among all types.
 */
export default function toGlobalId(type, id) {
    return base64([type, id].join(':'));
}