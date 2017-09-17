import React, {PropTypes} from "react"
import GraphiQL from 'graphiql'
import ReactDOM from 'react-dom';
import {
    buildClientSchema,
    GraphQLSchema,
    parse,
    print,
} from 'graphql';

import {getLeft, getTop} from 'graphiql/dist/utility/elementPosition';

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

let debounceEditQueryTimer
let debounceEditVariables

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
            const variableOpen = this.props.variableEditorOpen
            const variableStyle = {
                height: variableOpen ? this.props.variableEditorHeight : null
            }

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
                                    onRunQuery={() => null}
                                />
                                <div className="variable-editor" style={variableStyle}>
                                    <div
                                        className="variable-editor-title"
                                        style={{cursor: variableOpen ? 'row-resize' : 'n-resize'}}
                                        onMouseDown={this.handleVariableResizeStart}>
                                        {'Query Variables'}
                                    </div>
                                    <VariableEditor
                                        ref={n => {
                                            this.variableEditorComponent = n;
                                        }}
                                        value={this.props.variables}
                                        variableToType={this.props.variableToType}
                                        onEdit={this.handleEditVariables}
                                        onHintInformationRender={this.handleHintInformationRender}
                                        onRunQuery={() => null}
                                    />
                                </div>
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
            )
        }

        handleEditVariables = value => {
            if (this.props.onEditVariables) {
                if (debounceEditVariables) {
                    clearTimeout(debounceEditVariables)
                    debounceEditVariables = null
                }
                debounceEditVariables = setTimeout(() => {
                    this.props.onEditVariables(value);
                }, 200)
            }
        }

        handleHintInformationRender = elem => {
            elem.addEventListener('click', this._onClickHintInformation);

            let onRemoveFn;
            elem.addEventListener('DOMNodeRemoved', onRemoveFn = () => {
                elem.removeEventListener('DOMNodeRemoved', onRemoveFn);
                elem.removeEventListener('click', this._onClickHintInformation);
            });
        }

        handleEditQuery = (value) => {
            if (debounceEditQueryTimer) {
                clearTimeout(debounceEditQueryTimer)
                debounceEditQueryTimer = null
            }
            debounceEditQueryTimer = setTimeout(() => {
                this.props.onEditQuery(value)
            }, 200)
        }

        handleVariableResizeStart = downEvent => {
            downEvent.preventDefault();

            let didMove = false;
            const wasOpen = this.props.variableEditorOpen;
            const hadHeight = this.props.variableEditorHeight;
            const offset = downEvent.clientY - getTop(downEvent.target);

            let onMouseMove = moveEvent => {
                if (moveEvent.buttons === 0) {
                    return onMouseUp();
                }

                didMove = true;

                const editorBar = ReactDOM.findDOMNode(this.editorBarComponent);
                const topSize = moveEvent.clientY - getTop(editorBar) - offset;
                const bottomSize = editorBar.clientHeight - topSize;
                if (bottomSize < 60) {
                    this.props.onVariableEditorSettingsChange({
                        open: false,
                        height: hadHeight
                    })
                } else {
                    this.props.onVariableEditorSettingsChange({
                        open: true,
                        height: bottomSize
                    });
                }
            };

            let onMouseUp = () => {
                if (!didMove) {
                    this.props.onVariableEditorSettingsChange({
                        open: !wasOpen,
                        height: this.props.variableEditorHeight
                    });
                }

                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                onMouseMove = null;
                onMouseUp = null;
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }

        _onClickHintInformation = event => {
            if (event.target.className === 'typeName') {
                const typeName = event.target.innerHTML;
                const schema = this.props.schema;
                if (schema) {
                    const type = schema.getType(typeName);
                    if (type) {
                        this.props.onOpenDocumentationWithType(type)
                    }
                }
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
