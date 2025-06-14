import { ClassicPreset as classic_preset } from "rete";

import { image_socket } from "../../utils/sockets";
import { area } from "../../utils/globals";

import { useRef } from "react";

import { v4 as uuidv4 } from "uuid";
import { node_store } from "../../utils/store";
import { FabricImage as fabric_image } from "fabric";
import { image_transport } from "../../utils/utils";
import { process_nodes } from "../../utils/node-compiling";

export class image_input_control extends classic_preset.Control {
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

export function image_input_control_component({ data }: { data: image_input_control }) {
    const input_ref = useRef<HTMLInputElement>();

    function handle_file_change(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;
        
        fabric_image.fromURL(URL.createObjectURL(file))
            .then((img) => {
                node_store.getState().set_image(data.id, img);
                const new_image_transport = new image_transport(data.id);

                data.setValue(new_image_transport);
                area.update("control", data.id);
            })
            .catch((err) => console.error(err));
    }

    return (
        <div>
            <button
                className="w-full border border-gray-300 rounded-sm p-1 px-2"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => {
                    input_ref.current?.click();
                }}
            >
                {
                    data.image_transport?.image_id ? "Change Image" : "Upload Image"
                }
            </button>
            <input
                type="file"
                className="hidden"
                // @ts-expect-error it works, idk why its saying otherwise :I
                ref={input_ref}
                accept="image/*"
                onChange={handle_file_change}
            />
        </div>
    );
}

export class image_node extends classic_preset.Node {
    width = 180;
    height = 170;
    id: string;

    constructor(change?: (updated_node_id?: string) => void, initial_image_id?: string) {
        super("Image Input");

        this.id = uuidv4();

        this.addControl("image", new image_input_control(initial_image_id ? new image_transport(initial_image_id) : undefined, this.id, change));
        this.addOutput("image", new classic_preset.Output(image_socket, "image"));
    }

    data(): { image?: image_transport } {
        const image_control = this.controls.image as image_input_control;

        const cloned_image_transport = image_control.image_transport?.clone();

        return { image: cloned_image_transport };
    }

    clone() {
        const image_control = this.controls.image as image_input_control;
        return new image_node(process_nodes, image_control.image_transport?.image_id);
    }
}