export default function applyVariablesToHeaders(variables, headers) {

    return headers.reduce((result, headerValue, headerKey) => {

        variables.forEach((varValue, varKey) => {
            headerValue = headerValue.replace(`{{${varKey}}}`, varValue)
        })

        result[headerKey] = headerValue

        return result
    }, {})
}