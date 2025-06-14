import { ClassicPreset } from "rete";

import { image_socket, select_socket } from "../../utils/sockets";
import { filter, image_transport } from "../../utils/utils";
import { filters } from "fabric";
import { image_input_control } from "../inputs/image-input";
import { select_input_control } from "../inputs/select-input";

export class blend_image_filter_node extends ClassicPreset.Node {
    width = 180;
    height = 290;

    constructor(change?: (updated_node_id?: string) => void) {
        super("Blend Image - Image Modifier");

        const blend_image = new ClassicPreset.Input(image_socket, "blend image");
        blend_image.addControl(new image_input_control(undefined, this.id, change));
        this.addInput("blend_image", blend_image);

        const mode = new ClassicPreset.Input(select_socket, "mode");
        mode.addControl(new select_input_control("multiply", ["multiply", "mask"], this.id, change));
        this.addInput("mode", mode);

        const image = new ClassicPreset.Input(image_socket, "image");
        image.addControl(new image_input_control(undefined, this.id, change));
        this.addInput("image", image);

        const output = new ClassicPreset.Output(image_socket, "image");
        this.addOutput("output", output);
    }

    data(inputs: { blend_image?: image_transport[], mode?: string[], image?: image_transport[] }): { output?: image_transport } {
        const blend_image_control = this.inputs.blend_image?.control as image_input_control;
        const blend_image = inputs.blend_image?.[0] ?? blend_image_control.image_transport;
        
        const mode_control = this.inputs.mode?.control as select_input_control;
        const mode = (inputs.mode?.[0] ?? mode_control.select) as blend_image_mode_t;

        const image_control = this.inputs.image?.control as image_input_control;
        const image = inputs.image?.[0] ?? image_control.image_transport;

        if (!blend_image) return { output: undefined };

        const filter = new blend_image_filter(this.id, blend_image, mode);

        const output = image?.clone();
        output?.filters.push(filter);

        return { output };
    }
}

export type blend_image_mode_t =
  | 'multiply'
  | 'mask';

export class blend_image_filter extends filter {
    id: string;
    blend_image: image_transport;
    mode: blend_image_mode_t;
    
    constructor(id: string, blend_image: image_transport, mode?: blend_image_mode_t) {
        super();
        this.id = id;
        this.blend_image = blend_image;
        this.mode = mode ?? "multiply";
    }
    
    to_fabric_filter() {
        return new filters.BlendImage({
            image: this.blend_image.get_fabric_image(),
            mode: this.mode,
        });
    }

    update(filter: blend_image_filter): void {
        this.blend_image = filter.blend_image;
        this.mode = filter.mode;
    }

    clone(): filter {
        return new blend_image_filter(this.id, this.blend_image, this.mode);
    }
}