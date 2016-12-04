import React from "react"
import createModal from "app/utils/create-modal"

export default (store, selectors, actionCreators, ProjectFormModal) => {

    ProjectFormModal = createModal(ProjectFormModal)

    return class ProjectEditModal extends React.Component {

        render() {

            return (
                <ProjectFormModal
                    ref={ref => this.modal = ref}
                    title="Edit Project"
                />
            )
        }

        open = async({id}) => {

            const state = store.getState()
            const project = selectors.findProject(state, {id})

            const result = await this.modal.open({
                project
            })

            if (result.status === 'SAVE') {

                store.dispatch(actionCreators.projectsUpdate({
                    id: project.get('id'),
                    data: result.payload.input
                }))
            }
        }
    }
}