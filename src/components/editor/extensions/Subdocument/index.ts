import { Fragment, Slice } from 'prosemirror-model'
import { Plugin, PluginKey } from 'prosemirror-state'
import { documentsApi } from 'src/services/documents'
import store from 'src/store'

import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import Component from './Component'

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        subdocument: {
            /**
             * Inserts a subdocument with the given document id
             */
            insertSubdocument: (docId: string) => ReturnType
        }
    }
}

export default Node.create({
    name: "subdocument",
    addAttributes() {
        return {
            docId: {
                type: "string",
                isRequired: true
            }
        }
    },

    group: "block",

    parseHTML() {
        return [{ tag: "div", ignore: true }]
    },

    renderHTML({ HTMLAttributes }) {
        return ["div", mergeAttributes(HTMLAttributes)]
    },

    addCommands() {
        return {
            insertSubdocument: (docId) => (props) => {
                return props.commands.insertContent({
                    type: "subdocument",
                    attrs: {
                        docId
                    }
                })
            }
        }
    },

    addNodeView() {
        return ReactNodeViewRenderer(Component)
    },

    addPasteRules() {
        // TODO : Add paste rules.
        return []
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey(),
                props: {
                    handleDrop(view, event, slice) {
                        if (event.ctrlKey === true) {
                            // TODO : When dropping a "subdocument" that has been duplicated
                            // with Ctrl + Drag, create a duplicate in the database too.
                        }
                    }
                    // handlePaste(view, event, slice) {
                    //     // Filter pasted content by removing subdocuments

                    //     let filteredContent = []
                    //     let handled = false

                    //     // slice.content.forEach((node) => {
                    //     //     if (node.type.name !== "subdocuments") {
                    //     //         node.descendants((node, pos, parent, index) => {

                    //     //         })
                    //     //         filteredContent.push(node)
                    //     //     }
                    //     // })

                    //     // If there is no subdocuments, we let the default paste
                    //     // handler do the transaction
                    //     if (handled === false) return false

                    //     view.dispatch(
                    //         view.state.tr.replaceSelection(
                    //             new Slice(
                    //                 Fragment.fromArray(filteredContent),
                    //                 slice.openStart,
                    //                 slice.openEnd
                    //             )
                    //         )
                    //     )

                    //     return true
                    // }
                    // transformPasted(slice) {
                    //     // TODO : Duplicate on database too.
                    //     // Note : a document with the given ID may exist in the database even if
                    //     // the user doesn't have access to.

                    //     // const test = new Promise(resolve => setTimeout(resolve, 3000));

                    //     return slice
                    // }
                },
                filterTransaction: (tr, state) => {
                    if (tr.getMeta("uiEvent") === "drop") {
                        return true
                    }

                    const replaceSteps = []
                    tr.steps.forEach((step, index) => {
                        if (step.toJSON().stepType === "replace") {
                            replaceSteps.push(index)
                        }
                    })

                    replaceSteps.forEach((index) => {
                        const map = tr.mapping.maps[index]
                        map.forEach((oldStart, oldEnd) => {
                            state.doc.nodesBetween(
                                oldStart,
                                oldEnd,
                                (node, pos) => {
                                    if (node.type.name === "subdocument") {
                                        store.dispatch(
                                            documentsApi.endpoints.deleteDocument.initiate(
                                                {
                                                    id: node.attrs.docId
                                                }
                                            )
                                        )
                                    }
                                }
                            )
                        })
                    })

                    return true
                }
            })
        ]
    }
})
