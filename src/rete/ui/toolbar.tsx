import { ClassicPreset } from "rete";

import { auto_arrange, spawn_node } from "../utils/globals";
import { Blend, BringToFront, ChevronDown, ChevronUp, FileInput, FileOutput, Info, Settings, Shapes } from 'lucide-react';
import { useState } from "react";

import { image_node } from "../nodes/inputs/image-input";
import { image_preview_node } from "../nodes/outputs/image-preview";
import { blur_filter_node } from "../nodes/modifiers/blur";
import { number_node } from "../nodes/inputs/number-input";
import { process_nodes } from "../utils/node-compiling";
import { blend_color_filter_node } from "../nodes/modifiers/blend-color";
import { color_node } from "../nodes/inputs/color-input";
import { blend_image_filter_node } from "../nodes/modifiers/blend-image";
import { brightness_filter_node } from "../nodes/modifiers/brightness";
import { color_matrix_node } from "../nodes/inputs/color-matrix-input";
import { color_matrix_filter_node } from "../nodes/modifiers/color-matrix";
import { contrast_filter_node } from "../nodes/modifiers/contrast";
import { boolean_node } from "../nodes/inputs/boolean-input";
import { convolute_matrix_node } from "../nodes/inputs/convolute-matrix-input";
import { convolute_matrix_filter_node } from "../nodes/modifiers/convolute-matrix";
import { rgb_matrix_node } from "../nodes/inputs/rgb-matrix-input";
import { gamma_filter_node } from "../nodes/modifiers/gamma";
import { string_node } from "../nodes/inputs/string-input";
import { grayscale_filter_node } from "../nodes/modifiers/grayscale";
import { png_download_node } from "../nodes/outputs/png-download";
import { base64_download_node } from "../nodes/outputs/base64-download";
import { bitmap_download_node } from "../nodes/outputs/bitmap-download";
import { jpeg_download_node } from "../nodes/outputs/jpeg-download";
import { webp_download_node } from "../nodes/outputs/webp-download";
import { canvas_node } from "../nodes/outputs/canvas";
import { hue_rotation_filter_node } from "../nodes/modifiers/hue-rotation";
import { color_2_node } from "../nodes/inputs/color-2-input";
import { invert_filter_node } from "../nodes/modifiers/invert";
import { noise_filter_node } from "../nodes/modifiers/noise";
import { pixelate_filter_node } from "../nodes/modifiers/pixelate";
import { remove_color_filter_node } from "../nodes/modifiers/remove-color";
import { saturation_filter_node } from "../nodes/modifiers/saturate";
import { vibrance_filter_node } from "../nodes/modifiers/vibrance";
import { scalar_matrix_node } from "../nodes/modifiers/scalar-matrix";
import { info_store } from "../../info/utils/store";


const input_tools: Record<string, () => ClassicPreset.Node> = {
    "Image": () => new image_node(process_nodes),
    //"AI Image": () => new image_gen_node(process_nodes),
    "Number": () => new number_node(1, process_nodes),
    "Color": () => new color_node("#ffffff", process_nodes),
    "Color 2": () => new color_2_node("#ffffff", process_nodes),
    //"Select": () => new select_node("b", ["a", "b", "c"], process_nodes),
    "Color Matrix": () => new color_matrix_node(undefined, process_nodes),
    "Boolean": () => new boolean_node(true, process_nodes),
    "Convolute Matrix": () => new convolute_matrix_node(undefined, process_nodes),
    "RGB Matrix": () => new rgb_matrix_node(undefined, process_nodes),
    "String": () => new string_node(undefined, process_nodes),
}
const primitive_tools: Record<string, () => ClassicPreset.Node> = {
    "Linear Gradient": () => new image_node(process_nodes, "linear-gradient"),
    "Edge Detection": () => new convolute_matrix_node([-0.5, 0, 0.5, -1, 0, 1, -0.5, 0, 0.5], process_nodes),
}
const modifier_tools: Record<string, () => ClassicPreset.Node> = {
    "Blend Color": () => new blend_color_filter_node(process_nodes),
    "Blend Image": () => new blend_image_filter_node(process_nodes),
    "Blur": () => new blur_filter_node(process_nodes),
    "Brightness": () => new brightness_filter_node(process_nodes),
    "Color Matrix": () => new color_matrix_filter_node(process_nodes),
    "Contrast": () => new contrast_filter_node(process_nodes),
    "Convolute": () => new convolute_matrix_filter_node(process_nodes),
    "Gamma": () => new gamma_filter_node(process_nodes),
    "Grayscale": () => new grayscale_filter_node(process_nodes),
    "Hue Rotation": () => new hue_rotation_filter_node(process_nodes),
    "Invert": () => new invert_filter_node(process_nodes),
    "Noise": () => new noise_filter_node(process_nodes),
    "Pixelate": () => new pixelate_filter_node(process_nodes),
    "Remove Color": () => new remove_color_filter_node(process_nodes),
    "Saturation": () => new saturation_filter_node(process_nodes),
    "Vibrance": () => new vibrance_filter_node(process_nodes),
    "Scalar Matrix": () => new scalar_matrix_node(process_nodes),
}
const output_tools: Record<string, () => ClassicPreset.Node> = {
    "Image Preview": () => new image_preview_node(process_nodes),
    "Canvas": () => new canvas_node(process_nodes),
    "Base64 export": () => new base64_download_node(process_nodes),
    "Bitmap export": () => new bitmap_download_node(process_nodes),
    "JPEG export": () => new jpeg_download_node(process_nodes),
    "PNG export": () => new png_download_node(process_nodes),
    "WEBP export": () => new webp_download_node(process_nodes),
}

function InputOptions() {
    return (
        <div className="grid grid-cols-2 min-w-md h-fit rounded-xl p-3 flex-row gap-4 bg-[#303030] border border-[#646464] shadow-xl shadow-[#000000aa] text-white pointer-events-auto">
            {
                Object.keys(input_tools).map((tool_key) => (
                    <button key={tool_key} onClick={() => spawn_node(input_tools[tool_key]())} className="opacity-75 hover:opacity-100 cursor-pointer">
                        {tool_key}
                    </button>
                ))
            }
        </div>
    )
}
function PrimitiveOptions() {
    return (
        <div className="grid grid-cols-2 min-w-md h-fit rounded-xl p-3 flex-row gap-4 bg-[#303030] border border-[#646464] shadow-xl shadow-[#000000aa] text-white pointer-events-auto">
            {
                Object.keys(primitive_tools).map((tool_key) => (
                    <button key={tool_key} onClick={() => spawn_node(primitive_tools[tool_key]())} className="opacity-75 hover:opacity-100 cursor-pointer">
                        {tool_key}
                    </button>
                ))
            }
        </div>
    )
}
function ModifierOptions() {
    return (
        <div className="grid grid-cols-3 min-w-md h-fit rounded-xl p-3 flex-row gap-4 bg-[#303030] border border-[#646464] shadow-xl shadow-[#000000aa] text-white pointer-events-auto">
            {
                Object.keys(modifier_tools).map((tool_key) => (
                    <button key={tool_key} onClick={() => spawn_node(modifier_tools[tool_key]())} className="opacity-75 hover:opacity-100 cursor-pointer">
                        {tool_key}
                    </button>
                ))
            }
        </div>
    )
}
function OutputOptions() {
    return (
        <div className="grid grid-cols-2 min-w-md h-fit rounded-xl p-3 flex-row gap-4 bg-[#303030] border border-[#646464] shadow-xl shadow-[#000000aa] text-white pointer-events-auto">
            {
                Object.keys(output_tools).map((tool_key) => (
                    <button key={tool_key} onClick={() => spawn_node(output_tools[tool_key]())} className="opacity-75 hover:opacity-100 cursor-pointer">
                        {tool_key}
                    </button>
                ))
            }
        </div>
    )
}

const MAX_OPEN_OPTIONS = 1;

export default function NodeToolbar() {
    const [open_options, set_open_options] = useState<string[]>([]);
    function toggle_option(option: string) {
        if (open_options.includes(option)) set_open_options(open_options.filter(opt => opt != option));
        else {
            let options = [...open_options, option]
            console.log(options)
            if (options.length > MAX_OPEN_OPTIONS) options = options.slice(1, options.length);
            console.log(options)
            set_open_options(options)
        };
    }

    return (
        <div className="absolute w-screen h-fit bottom-0 left-0 z-10 p-2 flex flex-col gap-2 items-center pointer-events-none">
            {
                open_options.map(option => {
                    if (option == "input") return <InputOptions key={option} />
                    else if (option == "primitive") return <PrimitiveOptions key={option} />
                    else if (option == "modifier") return <ModifierOptions key={option} />
                    else if (option == "output") return <OutputOptions key={option} />
                })
            }
            
            <div className="w-fit h-fit rounded-xl p-3 flex flex-row gap-4 bg-[#303030] border border-[#646464] shadow-xl shadow-[#000000aa] text-white pointer-events-auto">
                <button onClick={() => toggle_option("input")} className="flex flex-row items-center gap-1 rounded-md p-2 opacity-75 cursor-pointer hover:text-white hover:opacity-100 transition-all">
                    <FileInput size={24} />
                    { open_options.includes("input") ? <ChevronUp size={16} /> : <ChevronDown size={16} /> }
                </button>
                <button onClick={() => toggle_option("primitive")} className="flex flex-row items-center gap-1 rounded-md p-2 opacity-75 cursor-pointer hover:text-white hover:opacity-100 transition-all">
                    <Shapes size={24} />
                    { open_options.includes("primitive") ? <ChevronUp size={16} /> : <ChevronDown size={16} /> }
                </button>
                <button onClick={() => toggle_option("modifier")} className="flex flex-row items-center gap-1 rounded-md p-2 opacity-75 cursor-pointer hover:text-white hover:opacity-100 transition-all">
                    <Blend size={24} />
                    { open_options.includes("modifier") ? <ChevronUp size={16} /> : <ChevronDown size={16} /> }
                </button>
                <button onClick={() => toggle_option("output")} className="flex flex-row items-center gap-1 rounded-md p-2 opacity-75 cursor-pointer hover:text-white hover:opacity-100 transition-all">
                    <FileOutput size={24} />
                    { open_options.includes("output") ? <ChevronUp size={16} /> : <ChevronDown size={16} /> }
                </button>
                <button onClick={() => info_store.getState().set_active(true)} className="ml-12 rounded-md p-2 opacity-75 cursor-pointer hover:text-white hover:opacity-100 transition-all">
                    <Info size={24} />
                </button>
                <button onClick={async () => await auto_arrange()} className="rounded-md p-2 opacity-75 cursor-pointer hover:text-white hover:opacity-100 transition-all">
                    <BringToFront size={24} />
                </button>
            </div>
        </div>
    )
}