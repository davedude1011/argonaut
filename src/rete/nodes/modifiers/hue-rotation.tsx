import { ClassicPreset } from "rete";

import { number_input_control } from "../inputs/number-input";
import { image_socket, number_socket } from "../../utils/sockets";
import { filter, image_transport } from "../../utils/utils";
import { filters } from "fabric";
import { image_input_control } from "../inputs/image-input";

export class hue_rotation_filter_node extends ClassicPreset.Node {
    width = 180;
    height = 230;

    constructor(change?: (updated_node_id?: string) => void) {
        super("Hue Rotation - Image Modifier");
        
        const hue_rotation = new ClassicPreset.Input(number_socket, "strength");
        hue_rotation.addControl(new number_input_control(25, this.id, change));
        this.addInput("hue_rotation", hue_rotation);
        
        const image = new ClassicPreset.Input(image_socket, "image");
        image.addControl(new image_input_control(undefined, this.id, change));
        this.addInput("image", image);

        const output = new ClassicPreset.Output(image_socket, "image");
        this.addOutput("output", output);
    }

    data(inputs: { hue_rotation?: number[], image?: image_transport[] }): { output?: image_transport } {
        const hue_rotation_control = this.inputs.hue_rotation?.control as number_input_control;
        const hue_rotation = inputs.hue_rotation?.[0] ?? hue_rotation_control.number;

        const image_control = this.inputs.image?.control as image_input_control;
        const image = inputs.image?.[0] ?? image_control.image_transport;

        const filter = new hue_rotation_filter(this.id, hue_rotation);

        const output = image?.clone();
        output?.filters.push(filter);

        return { output };
    }
}

export class hue_rotation_filter extends filter {
    id: string;
    hue_rotation: number;
    
    constructor(id: string, hue_rotation?: number) {
        super();
        this.id = id;
        this.hue_rotation = hue_rotation ?? 1;
    }
    
    to_fabric_filter() {
        return new filters.HueRotation({
            rotation: this.hue_rotation / 100,
        });
    }

    update(filter: hue_rotation_filter): void {
        this.hue_rotation = filter.hue_rotation;
    }

    clone(): filter {
        return new hue_rotation_filter(this.id, this.hue_rotation);
    }
}