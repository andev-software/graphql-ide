import uuid from "uuid"
import {Map, List} from "immutable"

export default (delegate) => {

    return {
        getHeaders: () => {
            return delegate.props.project.get('headers')
        },
        handleAddClick: () => {

            delegate.props.updateProject({
                id: delegate.props.project.get('id'),
                data: delegate.props.project.get('source').update('headers', headers => {

                    return headers.push(Map({
                        id: uuid.v4(),
                        key: '',
                        value: ''
                    }))
                })
            })
        },

        handleChange: ({id, header}) => {

            delegate.props.updateProject({
                id: delegate.props.project.get('id'),
                data: delegate.props.project.get('source').update('headers', headers => {

                    return headers.map(existingHeader => {

                        if (existingHeader.get('id') === id) {
                            return header
                        }

                        return existingHeader
                    })
                })
            })
        },

        handleRemove: ({id}) => {


            delegate.props.updateProject({
                id: delegate.props.project.get('id'),
                data: delegate.props.project.get('source').update('headers', headers => {

                    return headers.filter(header => {
                        return header.get('id') !== id
                    })
                })
            })
        },

        handleClear: () => {

            delegate.props.updateProject({
                id: delegate.props.project.get('id'),
                data: delegate.props.project.get('source').set('headers', List())
            })
        }
    }
}