import { ClassicPreset } from "rete";

import { convolute_matrix_socket, image_socket, number_socket } from "../../utils/sockets";
import { filter, image_transport } from "../../utils/utils";
import { filters } from "fabric";
import { image_input_control } from "../inputs/image-input";
import { boolean_input_control } from "../inputs/boolean-input";
import { convolute_matrix_input_control } from "../inputs/convolute-matrix-input";

export class convolute_matrix_filter_node extends ClassicPreset.Node {
    width = 300;
    height = 510;

    constructor(change?: (updated_node_id?: string) => void) {
        super("Convolute Matrix - Image Modifier");
        
        const convolute_matrix = new ClassicPreset.Input(convolute_matrix_socket, "convolute matrix");
        convolute_matrix.addControl(new convolute_matrix_input_control(undefined, this.id, change));
        this.addInput("convolute_matrix", convolute_matrix);
        
        const opaque = new ClassicPreset.Input(number_socket, "opaque only");
        opaque.addControl(new boolean_input_control(false, this.id, change));
        this.addInput("opaque", opaque);
        
        const image = new ClassicPreset.Input(image_socket, "image");
        image.addControl(new image_input_control(undefined, this.id, change));
        this.addInput("image", image);

        const output = new ClassicPreset.Output(image_socket, "image");
        this.addOutput("output", output);
    }

    data(inputs: { convolute_matrix?: number[][], opaque?: boolean[], image?: image_transport[] }): { output?: image_transport } {
        const convolute_matrix_control = this.inputs.convolute_matrix?.control as convolute_matrix_input_control;
        const convolute_matrix = inputs.convolute_matrix?.[0] ?? convolute_matrix_control.matrix;

        const opaque_control = this.inputs.opaque?.control as boolean_input_control;
        const opaque = inputs.opaque?.[0] ?? opaque_control.boolean;

        this.width = inputs.convolute_matrix?.[0] ? 180 : 300;
        this.height = inputs.convolute_matrix?.[0] ? 290 : 510;

        const image_control = this.inputs.image?.control as image_input_control;
        const image = inputs.image?.[0] ?? image_control.image_transport;

        const filter = new convolute_matrix_filter(this.id, convolute_matrix, opaque);
        
        const output = image?.clone();
        output?.filters.push(filter);

        return { output };
    }
}

export class convolute_matrix_filter extends filter {
    id: string;
    convolute_matrix: number[];
    opaque: boolean;
    
    constructor(id: string, convolute_matrix?: number[], opaque?: boolean) {
        super();
        this.id = id;
        this.convolute_matrix = convolute_matrix ?? [0, 0, 0, 0, 1, 0, 0, 0, 0];
        this.opaque = opaque ?? true;
    }
    
    to_fabric_filter() {
        return new filters.Convolute({
            matrix: this.convolute_matrix,
            opaque: this.opaque,
        });
    }

    update(filter: convolute_matrix_filter): void {
        this.convolute_matrix = filter.convolute_matrix;
    }

    clone(): filter {
        return new convolute_matrix_filter(this.id, this.convolute_matrix, this.opaque);
    }
}