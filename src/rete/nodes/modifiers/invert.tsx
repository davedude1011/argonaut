import { ClassicPreset } from "rete";

import { image_socket, } from "../../utils/sockets";
import { filter, image_transport } from "../../utils/utils";
import { filters } from "fabric";
import { image_input_control } from "../inputs/image-input";

export class invert_filter_node extends ClassicPreset.Node {
    width = 180;
    height = 230;

    constructor(change?: (updated_node_id?: string) => void) {
        super("Invert - Image Modifier");
        
        const image = new ClassicPreset.Input(image_socket, "image");
        image.addControl(new image_input_control(undefined, this.id, change));
        this.addInput("image", image);

        const output = new ClassicPreset.Output(image_socket, "image");
        this.addOutput("output", output);
    }

    data(inputs: { image?: image_transport[] }): { output?: image_transport } {
        const image_control = this.inputs.image?.control as image_input_control;
        const image = inputs.image?.[0] ?? image_control.image_transport;

        const filter = new invert_filter(this.id);
        
        const output = image?.clone();
        output?.filters.push(filter);

        return { output };
    }
}

export class invert_filter extends filter {
    id: string;
    
    constructor(id: string) {
        super();
        this.id = id;
    }
    
    to_fabric_filter() {
        return new filters.Invert();
    }

    update(_filter: invert_filter): void {
        
    }

    clone(): filter {
        return new invert_filter(this.id);
    }
}