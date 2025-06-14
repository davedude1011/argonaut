import { ClassicPreset } from "rete";

import { number_input_control } from "../inputs/number-input";
import { image_socket, number_socket } from "../../utils/sockets";
import { filter, image_transport } from "../../utils/utils";
import { filters } from "fabric";
import { image_input_control } from "../inputs/image-input";

export class saturation_filter_node extends ClassicPreset.Node {
    width = 180;
    height = 230;

    constructor(change?: (updated_node_id?: string) => void) {
        super("Saturation - Image Modifier");
        
        const saturation = new ClassicPreset.Input(number_socket, "strength");
        saturation.addControl(new number_input_control(25, this.id, change));
        this.addInput("saturation", saturation);
        
        const image = new ClassicPreset.Input(image_socket, "image");
        image.addControl(new image_input_control(undefined, this.id, change));
        this.addInput("image", image);

        const output = new ClassicPreset.Output(image_socket, "image");
        this.addOutput("output", output);
    }

    data(inputs: { saturation?: number[], image?: image_transport[] }): { output?: image_transport } {
        const saturation_control = this.inputs.saturation?.control as number_input_control;
        const saturation = inputs.saturation?.[0] ?? saturation_control.number;

        const image_control = this.inputs.image?.control as image_input_control;
        const image = inputs.image?.[0] ?? image_control.image_transport;

        console.log(saturation)

        const filter = new saturation_filter(this.id, saturation);

        const output = image?.clone();
        output?.filters.push(filter);

        return { output };
    }
}

export class saturation_filter extends filter {
    id: string;
    saturation: number;
    
    constructor(id: string, saturation?: number) {
        super();
        this.id = id;
        this.saturation = saturation ?? 1;
    }
    
    to_fabric_filter() {
        return new filters.Saturation({
            saturation: this.saturation / 100,
        });
    }

    update(filter: saturation_filter): void {
        this.saturation = filter.saturation;
    }

    clone(): filter {
        return new saturation_filter(this.id, this.saturation);
    }
}