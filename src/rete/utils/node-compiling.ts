import { Presets as presets } from "rete-react-plugin";
import { editor, engine } from "./globals";
import { structures } from "rete-structures"

import { image_input_control, image_input_control_component } from "../nodes/inputs/image-input";
import { image_preview_control, image_preview_control_component, image_preview_node } from "../nodes/outputs/image-preview";
import { number_input_control, number_input_control_component } from "../nodes/inputs/number-input";
import { color_input_control, color_input_control_component } from "../nodes/inputs/color-input";
import { select_input_control, select_input_control_component } from "../nodes/inputs/select-input";
import { color_matrix_input_control, color_matrix_input_control_component } from "../nodes/inputs/color-matrix-input";
import { boolean_input_control, boolean_input_control_component } from "../nodes/inputs/boolean-input";
import { convolute_matrix_input_control, convolute_matrix_input_control_component } from "../nodes/inputs/convolute-matrix-input";
import { rgb_matrix_input_control, rgb_matrix_input_control_component } from "../nodes/inputs/rgb-matrix-input";
import { image_gen_input_control, image_gen_input_control_component } from "../nodes/inputs/image-gen";
import { string_input_control, string_input_control_component } from "../nodes/inputs/string-input";
import { png_download_control, png_download_control_component } from "../nodes/outputs/png-download";
import { base64_download_control, base64_download_control_component } from "../nodes/outputs/base64-download";
import { webp_download_control, webp_download_control_component } from "../nodes/outputs/webp-download";
import { jpeg_download_control, jpeg_download_control_component } from "../nodes/outputs/jpeg-download";
import { bitmap_download_control, bitmap_download_control_component } from "../nodes/outputs/bitmap-download";
import { canvas_control, canvas_control_component } from "../nodes/outputs/canvas";
import { color_2_input_control, color_2_input_control_component } from "../nodes/inputs/color-2-input";

export const process_updating_nodes = [image_preview_node];

export function render_control(data: Record<"payload", any>) {
    if (data.payload instanceof image_input_control) {
        return image_input_control_component;
    }
    else if (data.payload instanceof number_input_control) {
        return number_input_control_component;
    }
    else if (data.payload instanceof color_input_control) {
        return color_input_control_component;
    }
    else if (data.payload instanceof select_input_control) {
        return select_input_control_component;
    }
    else if (data.payload instanceof color_matrix_input_control) {
        return color_matrix_input_control_component;
    }
    else if (data.payload instanceof boolean_input_control) {
        return boolean_input_control_component;
    }
    else if (data.payload instanceof convolute_matrix_input_control) {
        return convolute_matrix_input_control_component;
    }
    else if (data.payload instanceof rgb_matrix_input_control) {
        return rgb_matrix_input_control_component;
    }
    else if (data.payload instanceof string_input_control) {
        return string_input_control_component;
    }
    else if (data.payload instanceof color_2_input_control) {
        return color_2_input_control_component;
    }

    else if (data.payload instanceof image_preview_control) {
        return image_preview_control_component;
    }
    else if (data.payload instanceof image_gen_input_control) {
        return image_gen_input_control_component;
    }
    else if (data.payload instanceof base64_download_control) {
        return base64_download_control_component;
    }
    else if (data.payload instanceof bitmap_download_control) {
        return bitmap_download_control_component;
    }
    else if (data.payload instanceof webp_download_control) {
        return webp_download_control_component;
    }
    else if (data.payload instanceof jpeg_download_control) {
        return jpeg_download_control_component;
    }
    else if (data.payload instanceof png_download_control) {
        return png_download_control_component;
    }
    else if (data.payload instanceof canvas_control) {
        return canvas_control_component;
    }
    
    return presets.classic.Control;
}


export function process_nodes(updated_node_id?: string) {
    const graph = structures(editor);
    const node_successors = updated_node_id ? graph.successors(updated_node_id).nodes() : undefined
    const successor_ids = node_successors?.map(node => node.id)

    engine.reset();
    editor
        .getNodes()
        .filter(node => process_updating_nodes.some(node_type => node instanceof node_type))
        .filter(node => {
            if (!updated_node_id) return true; // Process all if no specific node
            // Include the updated node itself AND its successors
            return node.id === updated_node_id || successor_ids?.includes(node.id);
        })
        .forEach(node => engine.fetch(node.id));
}