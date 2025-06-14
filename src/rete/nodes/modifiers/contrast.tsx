import { ClassicPreset } from "rete";

import { number_input_control } from "../inputs/number-input";
import { image_socket, number_socket } from "../../utils/sockets";
import { filter, image_transport } from "../../utils/utils";
import { filters } from "fabric";
import { image_input_control } from "../inputs/image-input";

export class contrast_filter_node extends ClassicPreset.Node {
    width = 180;
    height = 230;

    constructor(change?: (updated_node_id?: string) => void) {
        super("contrast - Image Modifier");
        
        const contrast = new ClassicPreset.Input(number_socket, "strength");
        contrast.addControl(new number_input_control(25, this.id, change));
        this.addInput("contrast", contrast);
        
        const image = new ClassicPreset.Input(image_socket, "image");
        image.addControl(new image_input_control(undefined, this.id, change));
        this.addInput("image", image);

        const output = new ClassicPreset.Output(image_socket, "image");
        this.addOutput("output", output);
    }

    data(inputs: { contrast?: number[], image?: image_transport[] }): { output?: image_transport } {
        const contrast_control = this.inputs.contrast?.control as number_input_control;
        const contrast = inputs.contrast?.[0] ?? contrast_control.number;

        const image_control = this.inputs.image?.control as image_input_control;
        const image = inputs.image?.[0] ?? image_control.image_transport;

        const filter = new contrast_filter(this.id, contrast);
        
        const output = image?.clone();
        output?.filters.push(filter);

        return { output };
    }
}

export class contrast_filter extends filter {
    id: string;
    contrast: number;
    
    constructor(id: string, contrast?: number) {
        super();
        this.id = id;
        this.contrast = contrast ?? 1;
    }
    
    to_fabric_filter() {
        return new filters.Contrast({
            contrast: this.contrast / 100,
        });
    }

    update(filter: contrast_filter): void {
        this.contrast = filter.contrast;
    }

    clone(): filter {
        return new contrast_filter(this.id, this.contrast);
    }
}