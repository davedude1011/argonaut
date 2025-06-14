import { ClassicPreset as classic_preset, GetSchemes as get_schemes, NodeEditor as node_editor } from "rete";
import { AreaPlugin as area_plugin, AreaExtensions } from "rete-area-plugin";
import { ConnectionPlugin as connection_plugin } from "rete-connection-plugin";
import { DataflowEngine as dataflow_engine } from "rete-engine";
import { HistoryActions as history_actions, HistoryPlugin as history_plugin } from "rete-history-plugin";
import { ReactArea2D as react_area_2d, ReactPlugin as react_plugin } from "rete-react-plugin";
import { MinimapPlugin as minimap_plugin } from "rete-minimap-plugin";

import { createRoot } from "react-dom/client";
import { ArrangeAppliers as arrange_appliers, AutoArrangePlugin as auto_arrange_plugin } from "rete-auto-arrange-plugin";

export type schemes = get_schemes<any, classic_preset.Connection<classic_preset.Node, classic_preset.Node>>;
export type area_extra = react_area_2d<schemes>;

export let area: area_plugin<schemes, area_extra>; // value gets set on main function initiation
export function set_area(new_area: area_plugin<schemes, area_extra>) { area = new_area };

export const editor = new node_editor<schemes>();
export const connection = new connection_plugin<schemes, area_extra>();
export const render = new react_plugin<schemes, area_extra>({ createRoot });
export const engine = new dataflow_engine<schemes>();
export const history = new history_plugin<schemes, history_actions<schemes>>();
export const arrange = new auto_arrange_plugin<schemes>();
export const minimap = new minimap_plugin<schemes>();

export async function spawn_node(node: classic_preset.Node) {
    const { x, y, k } = area.area.transform;
    const box = area.container.getBoundingClientRect();
    const centerX = (box.width / 2 - x) / k;
    const centerY = (box.height / 2 - y) / k;
    
    await editor.addNode(node);
    await area.translate(node.id, { x: centerX, y: centerY });
}

const arrange_applier = new arrange_appliers.TransitionApplier<schemes, area_extra>({
    duration: 500,
    timingFunction: (t) => t,
    async onTick() {
        await AreaExtensions.zoomAt(area, editor.getNodes());
    }
});

export async function auto_arrange() {
    // @ts-expect-error
    await arrange.layout({ applier: arrange_applier });
}