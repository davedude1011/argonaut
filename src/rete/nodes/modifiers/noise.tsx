import { ClassicPreset } from "rete";

import { number_input_control } from "../inputs/number-input";
import { image_socket, number_socket } from "../../utils/sockets";
import { filter, image_transport } from "../../utils/utils";
import { filters } from "fabric";
import { image_input_control } from "../inputs/image-input";

export class noise_filter_node extends ClassicPreset.Node {
    width = 180;
    height = 230;

    constructor(change?: (updated_node_id?: string) => void) {
        super("Noise - Image Modifier");
        
        const noise = new ClassicPreset.Input(number_socket, "strength");
        noise.addControl(new number_input_control(25, this.id, change));
        this.addInput("noise", noise);
        
        const image = new ClassicPreset.Input(image_socket, "image");
        image.addControl(new image_input_control(undefined, this.id, change));
        this.addInput("image", image);

        const output = new ClassicPreset.Output(image_socket, "image");
        this.addOutput("output", output);
    }

    data(inputs: { noise?: number[], image?: image_transport[] }): { output?: image_transport } {
        const noise_control = this.inputs.noise?.control as number_input_control;
        const noise = inputs.noise?.[0] ?? noise_control.number;

        const image_control = this.inputs.image?.control as image_input_control;
        const image = inputs.image?.[0] ?? image_control.image_transport;

        console.log(noise)

        const filter = new noise_filter(this.id, noise);

        const output = image?.clone();
        output?.filters.push(filter);

        return { output };
    }
}

export class noise_filter extends filter {
    id: string;
    noise: number;
    
    constructor(id: string, noise?: number) {
        super();
        this.id = id;
        this.noise = noise ?? 1;
    }
    
    to_fabric_filter() {
        return new filters.Noise({
            noise: this.noise,
        });
    }

    update(filter: noise_filter): void {
        this.noise = filter.noise;
    }

    clone(): filter {
        return new noise_filter(this.id, this.noise);
    }
}