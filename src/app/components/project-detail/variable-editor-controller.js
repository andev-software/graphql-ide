export default (delegate) => {

    return {
        getVariables: () => {
            return delegate.props.project.getIn(['selectedEnvironment', 'variables'])
        },
        handleChange: ({variables}) => {
            delegate.props.updateProject({
                id: delegate.props.project.get('id'),
                data: delegate.props.project.get('source').update('environments', (envs) => {
                    return envs.map(env => {
                        if (env.get('id') === delegate.props.project.getIn(['selectedEnvironment', 'id'])) {
                            return env.set('variables', variables)
                        }
                        return env
                    })
                })
            })
        }
    }
}