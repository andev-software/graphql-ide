import DataStore from "app/data/data-store"
import DataCollection from "app/data/data-collection"

export default () => {

    return new DataStore()
        .collection(new DataCollection('projects')
            .createAction()
            .updateAction()
            .removeAction()
        )
        .collection(new DataCollection('tabs')
            .createAction()
            .updateAction()
            .removeAction()
        )
        .collection(new DataCollection('environments')
            .createAction()
            .updateAction()
            .removeAction()
        )
        .collection(new DataCollection('collectionQueries')
            .createAction()
            .updateAction()
            .removeAction()
        )
        .collection(new DataCollection('historyQueries')
            .createAction()
            .updateAction()
            .removeAction()
        )
}