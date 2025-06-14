import { ClassicPreset } from "rete";

import { number_input_control } from "../inputs/number-input";
import { image_socket, number_socket } from "../../utils/sockets";
import { filter, image_transport } from "../../utils/utils";
import { filters } from "fabric";
import { image_input_control } from "../inputs/image-input";

export class pixelate_filter_node extends ClassicPreset.Node {
    width = 180;
    height = 230;

    constructor(change?: (updated_node_id?: string) => void) {
        super("Pixelate - Image Modifier");
        
        const pixelate = new ClassicPreset.Input(number_socket, "strength");
        pixelate.addControl(new number_input_control(25, this.id, change));
        this.addInput("pixelate", pixelate);
        
        const image = new ClassicPreset.Input(image_socket, "image");
        image.addControl(new image_input_control(undefined, this.id, change));
        this.addInput("image", image);

        const output = new ClassicPreset.Output(image_socket, "image");
        this.addOutput("output", output);
    }

    data(inputs: { pixelate?: number[], image?: image_transport[] }): { output?: image_transport } {
        const pixelate_control = this.inputs.pixelate?.control as number_input_control;
        const pixelate = inputs.pixelate?.[0] ?? pixelate_control.number;

        const image_control = this.inputs.image?.control as image_input_control;
        const image = inputs.image?.[0] ?? image_control.image_transport;

        console.log(pixelate)

        const filter = new pixelate_filter(this.id, pixelate);

        const output = image?.clone();
        output?.filters.push(filter);

        return { output };
    }
}

export class pixelate_filter extends filter {
    id: string;
    pixelate: number;
    
    constructor(id: string, pixelate?: number) {
        super();
        this.id = id;
        this.pixelate = pixelate ?? 1;
    }
    
    to_fabric_filter() {
        return new filters.Pixelate({
            blocksize: this.pixelate / 10,
        });
    }

    update(filter: pixelate_filter): void {
        this.pixelate = filter.pixelate;
    }

    clone(): filter {
        return new pixelate_filter(this.id, this.pixelate);
    }
}