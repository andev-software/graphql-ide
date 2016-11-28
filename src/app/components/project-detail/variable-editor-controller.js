export default (delegate) => {

    return {
        getVariables: () => {
            return delegate.props.project.get('variables')
        },
        handleChange: ({variables}) => {

            delegate.props.updateProject({
                id: delegate.props.project.get('id'),
                data: delegate.props.project.get('source').set('variables', variables)
            })
        }
    }
}