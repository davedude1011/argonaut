import { ClassicPreset } from "rete";

import { image_socket, rgb_matrix_socket } from "../../utils/sockets";
import { filter, image_transport } from "../../utils/utils";
import { filters } from "fabric";
import { image_input_control } from "../inputs/image-input";
import { rgb_matrix_input_control } from "../inputs/rgb-matrix-input";

export class gamma_filter_node extends ClassicPreset.Node {
    width = 300;
    height = 260;

    constructor(change?: (updated_node_id?: string) => void) {
        super("gamma - Image Modifier");
        
        const gamma = new ClassicPreset.Input(rgb_matrix_socket, "gamma");
        gamma.addControl(new rgb_matrix_input_control(undefined, this.id, change));
        this.addInput("gamma", gamma);
        
        const image = new ClassicPreset.Input(image_socket, "image");
        image.addControl(new image_input_control(undefined, this.id, change));
        this.addInput("image", image);

        const output = new ClassicPreset.Output(image_socket, "image");
        this.addOutput("output", output);
    }

    data(inputs: { gamma?: [number, number, number][], image?: image_transport[] }): { output?: image_transport } {
        const gamma_control = this.inputs.gamma?.control as rgb_matrix_input_control;
        const gamma = inputs.gamma?.[0] ?? gamma_control.matrix;

        const image_control = this.inputs.image?.control as image_input_control;
        const image = inputs.image?.[0] ?? image_control.image_transport;

        this.width = inputs.gamma?.[0] ? 180 : 300;
        this.height = inputs.gamma?.[0] ? 230 : 260;

        const filter = new gamma_filter(this.id, gamma);
        
        const output = image?.clone();
        output?.filters.push(filter);

        return { output };
    }
}

export class gamma_filter extends filter {
    id: string;
    gamma: [number, number, number];
    
    constructor(id: string, gamma?: [number, number, number]) {
        super();
        this.id = id;
        this.gamma = gamma ?? [1, 1, 1];
    }
    
    to_fabric_filter() {
        return new filters.Gamma({
            gamma: this.gamma,
        });
    }

    update(filter: gamma_filter): void {
        this.gamma = filter.gamma;
    }

    clone(): filter {
        return new gamma_filter(this.id, this.gamma);
    }
}