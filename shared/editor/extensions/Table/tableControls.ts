import { Plugin, PluginKey, TextSelection } from "prosemirror-state"
import { Decoration, DecorationSet } from "prosemirror-view"

import { findParentNode } from "@tiptap/core"

const key = new PluginKey("tableControls")

export function tableControls() {
    return new Plugin({
        key,
        state: {
            init() {
                return new TableControlsState()
            },
            apply(tr, prev) {
                return prev.apply(tr)
            }
        },
        props: {
            handleDOMEvents: {
                mousemove: (view, event) => {
                    const pluginState = key.getState(view.state)

                    if (
                        !(event.target as HTMLElement).closest(
                            ".tableWrapper"
                        ) &&
                        pluginState.values.hoveredTable
                    ) {
                        return view.dispatch(
                            view.state.tr.setMeta(key, {
                                setHoveredTable: null,
                                setHoveredCell: null
                            })
                        )
                    }

                    const pos = view.posAtCoords({
                        left: event.clientX,
                        top: event.clientY
                    })

                    if (!pos) return

                    const table = findParentNode(
                        (node) => node.type.name === "table"
                    )(TextSelection.create(view.state.doc, pos.pos))
                    const cell = findParentNode(
                        (node) =>
                            node.type.name === "tableCell" ||
                            node.type.name === "tableHeader"
                    )(TextSelection.create(view.state.doc, pos.pos))

                    if (!table || !cell) return

                    if (pluginState.values.hoveredCell?.pos !== cell.pos) {
                        return view.dispatch(
                            view.state.tr.setMeta(key, {
                                setHoveredTable: table,
                                setHoveredCell: cell
                            })
                        )
                    }
                }
            },
            decorations: (state) => {
                const pluginState = key.getState(state)
                if (!pluginState) {
                    return null
                }

                const { hoveredTable, hoveredCell } = pluginState.values
                if (hoveredTable) {
                    const decorations = [
                        Decoration.node(
                            hoveredTable.pos,
                            hoveredTable.pos + hoveredTable.node.nodeSize,
                            {},
                            {
                                hoveredTable,
                                hoveredCell
                            }
                        )
                    ]

                    return DecorationSet.create(state.doc, decorations)
                }

                return null
            }
        }
    })
}

class TableControlsState {
    values

    constructor(props = {}) {
        this.values = {
            hoveredTable: null,
            hoveredCell: null,
            ...props
        }
    }

    apply(tr) {
        const actions = tr.getMeta(key)

        if (actions?.setHoveredTable !== undefined) {
            this.values.hoveredTable = actions.setHoveredTable
        }

        if (actions?.setHoveredCell !== undefined) {
            this.values.hoveredCell = actions.setHoveredCell
        }

        return this
    }
}
