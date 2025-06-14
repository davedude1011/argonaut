import { ClassicPreset as classic_preset, ClassicPreset } from "rete";

import { image_socket, string_socket } from "../../utils/sockets";
import { area } from "../../utils/globals";

import { useState } from "react";

import { v4 as uuidv4 } from "uuid";
import { node_store } from "../../utils/store";
import { FabricImage as fabric_image } from "fabric";
import { image_transport } from "../../utils/utils";
import { string_input_control } from "./string-input";

import { usePollinationsImage } from '@pollinations/react';
import { process_nodes } from "../../utils/node-compiling";

export class image_gen_input_control extends classic_preset.Control {
    constructor(
        public image_transport?: image_transport,
        public node_id?: string,
        public change?: (updated_node_id?: string) => void,
    ) {
        super();
    }

    setValue(image_transport: image_transport) {
        this.image_transport = image_transport;
        if (this.change) this.change(this.node_id);
    }
}

export function image_gen_input_control_component({ data }: { data: image_gen_input_control }) {
    const [loading, set_loading] = useState(false);
    const [prompt, set_prompt] = useState<string>("");
    const image_url = usePollinationsImage(prompt, {
        width: 1024,
        height: 1024,
        seed: 42,
        model: 'flux',
        nologo: true,
    });

    async function generate_image() {
        try {
            const res = await fetch(image_url, { mode: "cors" }); // still may not help
            const blob = await res.blob();

            const reader = new FileReader();
            reader.onload = () => {
                fabric_image.fromURL(reader.result as string)
                    .then((img) => {
                        node_store.getState().set_image(data.id, img);
                        const new_image_transport = new image_transport(data.id);

                        data.setValue(new_image_transport);
                        area.update("control", data.id);
                    });
            };
            reader.readAsDataURL(blob);
        } catch (err) {
            console.error("Failed to load image:", err);
        }
    }

    return (
        <div onPointerDown={(event) => event.stopPropagation()}>
            <button
                disabled={loading}
                className="w-full border border-gray-300 rounded-sm p-1 px-2"
                onClick={generate_image}
            >
                {
                    loading ? "Image Generating..." : "Generate Image"
                }
            </button>
            <input
                type="text"
                className="w-full border rounded-sm border-gray-300 p-1 px-2"
                value={prompt}
                onChange={(e) => {
                    set_prompt(e.target.value);
                }}
            />
        </div>
    );
}

export class image_gen_node extends classic_preset.Node {
    width = 250;
    height = 270;
    id: string;

    constructor(change?: (updated_node_id?: string) => void) {
        super("AI Image Generator");

        this.id = uuidv4();

        this.addControl("image", new image_gen_input_control(undefined, this.id, change));

        this.addOutput("image", new classic_preset.Output(image_socket, "image"));
                
        const prompt = new ClassicPreset.Input(string_socket, "prompt");
        prompt.addControl(new string_input_control("A cat on the moon.", this.id, change));
        this.addInput("prompt", prompt);
    }

    data(): { image?: image_transport } {
        const image_control = this.controls.image as image_gen_input_control;

        const cloned_image_transport = image_control.image_transport?.clone();

        return { image: cloned_image_transport };
    }

    clone() {
        return new image_gen_node(process_nodes);
    }
}