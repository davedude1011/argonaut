import { Presets as presets } from "rete-react-plugin";
import { AreaPlugin as area_plugin, AreaExtensions as area_extensions, Area2D } from "rete-area-plugin";
import { Presets as connection_preset } from "rete-connection-plugin";
import { HistoryExtensions as history_extension, Presets as history_preset } from "rete-history-plugin";
import { ConnectionPathPlugin as connection_path_plugin, Transformers as transformers } from 'rete-connection-path-plugin';
import { curveStep as curve_step } from 'd3-shape';
import { Presets as arrange_presets } from "rete-auto-arrange-plugin";
import { ContextMenuPlugin, Presets as ContextMenuPresets} from 'rete-context-menu-plugin';

import { area, area_extra, arrange, connection, editor, engine, history, minimap, render, schemes, set_area } from "./globals";
import { process_nodes, render_control } from "./node-compiling";

import { image_node } from "../nodes/inputs/image-input";
import { string_node } from "../nodes/inputs/string-input";
import { rgb_matrix_node } from "../nodes/inputs/rgb-matrix-input";
import { convolute_matrix_node } from "../nodes/inputs/convolute-matrix-input";
import { boolean_node } from "../nodes/inputs/boolean-input";
import { color_2_node } from "../nodes/inputs/color-2-input";
import { color_matrix_node } from "../nodes/inputs/color-matrix-input";
import { color_node } from "../nodes/inputs/color-input";
import { number_node } from "../nodes/inputs/number-input";
import { blend_color_filter_node } from "../nodes/modifiers/blend-color";
import { blend_image_filter_node } from "../nodes/modifiers/blend-image";
import { blur_filter_node } from "../nodes/modifiers/blur";
import { brightness_filter_node } from "../nodes/modifiers/brightness";
import { color_matrix_filter_node } from "../nodes/modifiers/color-matrix";
import { contrast_filter_node } from "../nodes/modifiers/contrast";
import { convolute_matrix_filter_node } from "../nodes/modifiers/convolute-matrix";
import { gamma_filter_node } from "../nodes/modifiers/gamma";
import { grayscale_filter_node } from "../nodes/modifiers/grayscale";
import { hue_rotation_filter_node } from "../nodes/modifiers/hue-rotation";
import { invert_filter_node } from "../nodes/modifiers/invert";
import { noise_filter_node } from "../nodes/modifiers/noise";
import { pixelate_filter_node } from "../nodes/modifiers/pixelate";
import { remove_color_filter_node } from "../nodes/modifiers/remove-color";
import { saturation_filter_node } from "../nodes/modifiers/saturate";
import { vibrance_filter_node } from "../nodes/modifiers/vibrance";

export async function init_editor(container: HTMLElement) {

    // <===== connection =====>
    connection.addPreset(connection_preset.classic.setup());


    // <===== render =====>
    render.addPreset(presets.classic.setup({
        customize: {
            control: render_control,
        }
    }));
    // @ts-expect-error
    render.addPreset(presets.minimap.setup({ size: 200 }));


    // <===== history =====>
    history.addPreset(history_preset.classic.setup());
    history_extension.keyboard(history);


    // <===== context menu =====>
    const context_menu = new ContextMenuPlugin<schemes>({
        items: ContextMenuPresets.classic.setup([
            ["inputs", [
                ["Image", () => new image_node(process_nodes)],
                ["Number", () => new number_node(undefined, process_nodes)],
                ["Color", () => new color_node(undefined, process_nodes)],
                ["Color 2", () => new color_2_node(undefined, process_nodes)],
                ["Color Matrix", () => new color_matrix_node(undefined, process_nodes)],
                ["Boolean", () => new boolean_node(undefined, process_nodes)],
                ["Convolute", () => new convolute_matrix_node(undefined, process_nodes)],
                ["RGB Matrix", () => new rgb_matrix_node(undefined, process_nodes)],
                ["String", () => new string_node(undefined, process_nodes)],
            ]],
            ["primitives", [
                ["Linear Gradient", () => new image_node(process_nodes, "linear-gradient")],
            ]],
            ["modifiers", [
                ["Blend Color", () => new blend_color_filter_node(process_nodes)],
                ["Blend Image", () => new blend_image_filter_node(process_nodes)],
                ["Blur", () => new blur_filter_node(process_nodes)],
                ["Brightness", () => new brightness_filter_node(process_nodes)],
                ["Color Matrix", () => new color_matrix_filter_node(process_nodes)],
                ["Contrast", () => new contrast_filter_node(process_nodes)],
                ["Convolute", () => new convolute_matrix_filter_node(process_nodes)],
                ["Gamma", () => new gamma_filter_node(process_nodes)],
                ["Grayscale", () => new grayscale_filter_node(process_nodes)],
                ["Hue Rotation", () => new hue_rotation_filter_node(process_nodes)],
                ["Invert", () => new invert_filter_node(process_nodes)],
                ["Noise", () => new noise_filter_node(process_nodes)],
                ["Pixelate", () => new pixelate_filter_node(process_nodes)],
                ["Remove Color", () => new remove_color_filter_node(process_nodes)],
                ["Saturation", () => new saturation_filter_node(process_nodes)],
                ["Vibrance", () => new vibrance_filter_node(process_nodes)],
            ]],
        ])
    });
    
    // @ts-expect-error
    render.addPreset(presets.contextMenu.setup());


    // <===== arrange =====>
    arrange.addPreset(arrange_presets.classic.setup());


    // <===== area =====>
    set_area(new area_plugin<schemes, area_extra>(container));

    area_extensions.selectableNodes(area, area_extensions.selector(), {
        accumulating: area_extensions.accumulateOnCtrl(),
    });

    editor.use(area);

    area.use(connection);
    area.use(history);
    area.use(render);
    area.use(arrange);
    // @ts-expect-error
    area.use(minimap)
    // @ts-expect-error
    area.use(context_menu);

    const MIN_SCALE = 0.2;
    const MAX_SCALE = 2.5;

    area.addPipe(context => {
        if (context.type === 'zoom') {
            const scale = context.data.zoom;

            // Clamp scale
            if (scale < MIN_SCALE) {
                context.data.zoom = MIN_SCALE;
            } else if (scale > MAX_SCALE) {
                context.data.zoom = MAX_SCALE;
            }
        }

        if (context.type === 'zoom' && context.data.source === 'dblclick') return;

        return context;
    });
    
    const background = document.createElement("div");

    background.classList.add("background");
    background.classList.add("fill-area");

    area.area.content.add(background);

    area.addPipe(context => {
      if (context.type ===  'zoom' && context.data.source === 'dblclick') return
      return context
    })

    area_extensions.simpleNodesOrder(area);
    area_extensions.showInputControl(area);


    // <===== editor =====>
    editor.use(engine);

    editor.addPipe((context) => {
        if (["connectioncreated", "connectionremoved"].includes(context.type)) {
            process_nodes();
        }
        return context;
    });

    const pathPlugin = new connection_path_plugin<schemes, Area2D<schemes>>({
        curve: () => curve_step,
        transformer: () => transformers.classic({ vertical: false, curvature: 0 }),
        arrow: () => false,
    });

    // @ts-ignore
    //render.use(pathPlugin);


    return {
        destroy: () => area.destroy(),
    }
}