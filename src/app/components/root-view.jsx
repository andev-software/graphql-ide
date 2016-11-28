import React from 'react'
import {Provider} from "react-redux"

export default (store, RouterView) => {

    return class RootView extends React.Component {

        render() {
            return (
                <div className="RootView">
                    <Provider store={store}>
                        <RouterView />
                    </Provider>
                </div>
            )
        }
    }
}