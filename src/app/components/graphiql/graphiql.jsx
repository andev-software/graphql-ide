import React, {PropTypes} from "react"
import GraphiQL from 'graphiql'
import ReactDOM from 'react-dom';
import {
    buildClientSchema,
    GraphQLSchema,
    parse,
    print,
} from 'graphql';

import {ExecuteButton} from 'graphiql/dist/components/ExecuteButton';
import {QueryEditor} from 'graphiql/dist/components/QueryEditor';
import {VariableEditor} from 'graphiql/dist/components/VariableEditor';
import {ResultViewer} from 'graphiql/dist/components/ResultViewer';
import {DocExplorer} from 'graphiql/dist/components/DocExplorer';
import CodeMirrorSizer from 'graphiql/dist/utility/CodeMirrorSizer';
import getQueryFacts from 'graphiql/dist/utility/getQueryFacts';
import getSelectedOperationName from 'graphiql/dist/utility/getSelectedOperationName';
import {
    introspectionQuery,
    introspectionQuerySansSubscriptions,
} from 'graphiql/dist/utility/introspectionQueries';
import debounce from "lodash/debounce"

export default () => {

    return class GraphiQL extends React.Component {

        static propTypes = {
            schema: PropTypes.instanceOf(GraphQLSchema),
            query: PropTypes.string,
            variables: PropTypes.string,
            operationName: PropTypes.string,
            response: PropTypes.string,
            storage: PropTypes.shape({
                getItem: PropTypes.func,
                setItem: PropTypes.func
            }),
            defaultQuery: PropTypes.string,
            onEditQuery: PropTypes.func,
            onEditVariables: PropTypes.func,
            onEditOperationName: PropTypes.func,
            onToggleDocs: PropTypes.func,
            getDefaultFieldNames: PropTypes.func
        }

        componentDidMount() {

            // Utility for keeping CodeMirror correctly sized.
            this.codeMirrorSizer = new CodeMirrorSizer();
        }

        componentDidUpdate() {
            // If this update caused DOM nodes to have changed sizes, update the
            // corresponding CodeMirror instance sizes to match.
            // this.codeMirrorSizer.updateSizes([
            //     this.queryEditorComponent,
            //     this.variableEditorComponent,
            //     this.resultComponent,
            // ]);
        }

        render() {

            console.log('render', this.props)

            return (
                <div className="graphiql-container">
                    <div className="editorWrap">
                        <div
                            ref={n => {
                                this.editorBarComponent = n;
                            }}
                            className="editorBar"
                            onMouseDown={this.handleResizeStart}>
                            <div className="queryWrap">
                                <QueryEditor
                                    ref={n => {
                                        this.queryEditorComponent = n;
                                    }}
                                    schema={this.props.schema}
                                    value={this.props.query}
                                    onEdit={this.handleEditQuery}
                                    onHintInformationRender={this.handleHintInformationRender}
                                    onRunQuery={this.handleEditorRunQuery}
                                />
                            </div>
                            <div className="resultWrap">
                                {
                                    this.props.isWaitingForResponse &&
                                    <div className="spinner-container">
                                        <div className="spinner"/>
                                    </div>
                                }
                                <ResultViewer
                                    ref={c => {
                                        this.resultComponent = c;
                                    }}
                                    value={this.props.response}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        handleEditQuery = (value) => {
            if (this.props.onEditQuery) {
                this.props.onEditQuery(value)
            }
        }
    }
}


// Duck-type promise detection.
function isPromise(value) {
    return typeof value === 'object' && typeof value.then === 'function';
}

// Duck-type Observable.take(1).toPromise()
function observableToPromise(observable) {
    if (!isObservable(observable)) {
        return observable;
    }
    return new Promise((resolve, reject) => {
        const subscription = observable.subscribe(
            v => {
                resolve(v);
                subscription.unsubscribe();
            },
            reject,
            () => {
                reject(new Error('no value resolved'));
            }
        );
    });
}

// Duck-type observable detection.
function isObservable(value) {
    return typeof value === 'object' && typeof value.subscribe === 'function';
}