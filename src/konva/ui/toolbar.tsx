import { ArrowLeftToLine, Axis3d, ChevronDown, ChevronUp, Fullscreen, Grid2X2Plus, ImagePlus, RotateCwIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { konva_image, konva_object } from "../utils/utils";
import { editor, engine } from "../../rete/utils/globals";
import { image_transport } from "../../rete/utils/utils";
import { canvas_store } from "../utils/store";

function KonvaImageCanvas({ image }: { image: konva_image }) {
  const canvas_ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas_ref.current) return;

    const img = image.toCanvas();
    if (!img) return;

    const canvas = canvas_ref.current;
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  }, [image])

  return <canvas className="w-full rounded-md opacity-75 hover:opacity-100 cursor-pointer" onClick={() => canvas_store.getState().push_image_to_active_canvas(image.clone())} ref={canvas_ref} />
}

function ImageOptions() {
    const [global_images, set_global_images] = useState<konva_image[]>([]);
    
    useEffect(() => {
        async function load_global_images() {
            const images: konva_image[] = [];

            for (const node of editor.getNodes()) {
            if (!node.id) continue;

            try {
                const node_outputs = await engine.fetch(node);
                if (!node_outputs) continue;

                for (const key of Object.keys(node_outputs)) {
                const output = node_outputs[key];
                if (!(output instanceof image_transport)) continue;

                const image = output.to_konva_image();
                if (!image) continue;

                image.setAttrs({ x: 300, y: 200, draggable: true });
                images.push(image);
                }
            } catch {};
            }

            set_global_images(images);
        }
        load_global_images();
    }, []);

    return (
        <div className="columns-2 gap-3 max-w-lg h-fit rounded-xl p-3 bg-[#303030] border border-[#646464] shadow-xl shadow-[#000000aa] text-white overflow-y-auto max-h-[80vh] pointer-events-auto">
            {global_images.map((image, index) => (
                <div key={index} className="break-inside-avoid mb-3">
                <KonvaImageCanvas image={image} />
                </div>
            ))}
        </div>
    )
}

function AnchorOptions() {
    const store = canvas_store();
    return (
        <div className="grid grid-cols-3 min-w-96 h-fit rounded-xl p-3 flex-row gap-4 bg-[#303030] border border-[#646464] shadow-xl shadow-[#000000aa] text-white pointer-events-auto">
            {
                ["top-left", "top-center", "top-right", "middle-left", "", "middle-right", "bottom-left", "bottom-center", "bottom-right"].map((anchor_position) => (
                    anchor_position ?
                        <button onClick={() => store.toggle_anchor(anchor_position)} className={`${store.enabled_anchors.includes(anchor_position) ? "opacity-75" : "opacity-25"} hover:opacity-100 transition-all cursor-pointer`}>
                            {anchor_position}
                        </button>
                    : <div></div>
                ))
            }
        </div>
    )
}

function RotationOptions() {
    const store = canvas_store();
    return (
        <div className="grid grid-cols-3 min-w-96 h-fit rounded-xl p-3 flex-row gap-4 bg-[#303030] border border-[#646464] shadow-xl shadow-[#000000aa] text-white pointer-events-auto">
            {
                [1, 5, 10, 15, 22.5, 30, 45, 60, 90, 120, 180].map((rotation_increment) => (
                    <button onClick={() => store.set_rotation_increment(rotation_increment)} className={`${store.rotation_increment == rotation_increment ? "opacity-75" : "opacity-25"} hover:opacity-100 transition-all cursor-pointer`}>
                        {rotation_increment}
                    </button>
                ))
            }
        </div>
    )
}

function SnapOptions() {
    const store = canvas_store();
    return (
        <div className="grid grid-cols-2 min-w-96 h-fit rounded-xl p-3 flex-row gap-4 bg-[#303030] border border-[#646464] shadow-xl shadow-[#000000aa] text-white pointer-events-auto">
            <button onClick={() => store.set_smart_guides(!store.smart_guides)} className={`${store.smart_guides ? "opacity-75" : "opacity-25"} hover:opacity-100 transition-all cursor-pointer`}>
                Smart Guides
            </button>
            <button onClick={() => store.set_grid(!store.grid)} className={`${store.grid ? "opacity-75" : "opacity-25"} hover:opacity-100 transition-all cursor-pointer`}>
                Grid
            </button>
        </div>
    )
}

function ObjectOptions() {
    const store = canvas_store();
    return (
        <div className="grid grid-cols-3 min-w-96 h-fit rounded-xl p-3 flex-row gap-4 bg-[#303030] border border-[#646464] shadow-xl shadow-[#000000aa] text-white pointer-events-auto">
            <button onClick={() => {
                const object = new konva_object({
                    x: 100,
                    y: 100,
                    width: 150,
                    height: 100,
                    fill: 'skyblue',
                    draggable: true,
                });
                store.push_object_to_active_canvas(object);
            }} className={`${store.smart_guides ? "opacity-75" : "opacity-25"} hover:opacity-100 transition-all cursor-pointer`}>
                Block
            </button>
        </div>
    )
}

const MAX_OPEN_OPTIONS = 1;

export default function CanvasToolbar({ handleSave }: { handleSave: () => void }) {
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
        <div className="absolute w-screen h-fit bottom-0 z-30 left-0 p-2 flex flex-col gap-2 items-center pointer-events-none">
            {
                open_options.map(option => {
                    if (option == "image") return <ImageOptions key={option} />
                    else if (option == "object") return <ObjectOptions key={option} />
                    else if (option == "anchor") return <AnchorOptions key={option} />
                    else if (option == "rotation") return <RotationOptions key={option} />
                    else if (option == "snap") return <SnapOptions key={option} />
                })
            }
            
            <div className="w-fit min-w-96 h-fit rounded-xl p-3 flex flex-row gap-4 bg-[#303030] border border-[#646464] shadow-xl shadow-[#000000aa] text-white pointer-events-auto">
                <button onClick={() => toggle_option("image")} className="flex flex-row items-center gap-1 rounded-md p-2 opacity-75 cursor-pointer hover:text-white hover:opacity-100 transition-all">
                    <ImagePlus size={24} />
                    { open_options.includes("image") ? <ChevronUp size={16} /> : <ChevronDown size={16} /> }
                </button>
                <button onClick={() => toggle_option("object")} className="flex flex-row items-center gap-1 rounded-md p-2 opacity-75 cursor-pointer hover:text-white hover:opacity-100 transition-all">
                    <Grid2X2Plus size={24} />
                    { open_options.includes("object") ? <ChevronUp size={16} /> : <ChevronDown size={16} /> }
                </button>
                <button onClick={() => toggle_option("anchor")} className="flex flex-row items-center gap-1 rounded-md p-2 opacity-75 cursor-pointer hover:text-white hover:opacity-100 transition-all">
                    <Fullscreen size={24} />
                    { open_options.includes("anchor") ? <ChevronUp size={16} /> : <ChevronDown size={16} /> }
                </button>
                <button onClick={() => toggle_option("rotation")} className="flex flex-row items-center gap-1 rounded-md p-2 opacity-75 cursor-pointer hover:text-white hover:opacity-100 transition-all">
                    <RotateCwIcon size={24} />
                    { open_options.includes("rotation") ? <ChevronUp size={16} /> : <ChevronDown size={16} /> }
                </button>
                <button onClick={() => toggle_option("snap")} className="flex flex-row items-center gap-1 rounded-md p-2 opacity-75 cursor-pointer hover:text-white hover:opacity-100 transition-all">
                    <Axis3d size={24} />
                    { open_options.includes("snap") ? <ChevronUp size={16} /> : <ChevronDown size={16} /> }
                </button>
                <button onClick={async() => {
                    await handleSave();
                    canvas_store.getState().set_active_canvas(null);
                }} className="ml-12 rounded-md p-2 opacity-75 cursor-pointer hover:text-white hover:opacity-100 transition-all">
                    <ArrowLeftToLine size={24} />
                </button>
            </div>
        </div>
    )
}