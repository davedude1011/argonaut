import { ClassicPreset } from "rete";

import { color_matrix_socket, image_socket, number_socket } from "../../utils/sockets";
import { filter, image_transport } from "../../utils/utils";
import { filters } from "fabric";
import { image_input_control } from "../inputs/image-input";
import { color_matrix_input_control } from "../inputs/color-matrix-input";
import { boolean_input_control } from "../inputs/boolean-input";

export class color_matrix_filter_node extends ClassicPreset.Node {
    width = 470;
    height = 570;

    constructor(change?: (updated_node_id?: string) => void) {
        super("Color Matrix - Image Modifier");
        
        const color_matrix = new ClassicPreset.Input(color_matrix_socket, "color matrix");
        color_matrix.addControl(new color_matrix_input_control(undefined, this.id, change));
        this.addInput("color_matrix", color_matrix);
        
        const colors_only = new ClassicPreset.Input(number_socket, "colors only");
        colors_only.addControl(new boolean_input_control(true, this.id, change));
        this.addInput("colors_only", colors_only);
        
        const image = new ClassicPreset.Input(image_socket, "image");
        image.addControl(new image_input_control(undefined, this.id, change));
        this.addInput("image", image);

        const output = new ClassicPreset.Output(image_socket, "image");
        this.addOutput("output", output);
    }

    data(inputs: { color_matrix?: number[][], colors_only?: boolean[], image?: image_transport[] }): { output?: image_transport } {
        const color_matrix_control = this.inputs.color_matrix?.control as color_matrix_input_control;
        const color_matrix = inputs.color_matrix?.[0] ?? color_matrix_control.matrix;

        const colors_only_control = this.inputs.colors_only?.control as boolean_input_control;
        const colors_only = inputs.colors_only?.[0] ?? colors_only_control.boolean;

        this.width = inputs.color_matrix?.[0] ? 180 : 470;
        this.height = inputs.color_matrix?.[0] ? 290 : 570;

        const image_control = this.inputs.image?.control as image_input_control;
        const image = inputs.image?.[0] ?? image_control.image_transport;

        const filter = new color_matrix_filter(this.id, color_matrix, colors_only);
        
        const output = image?.clone();
        output?.filters.push(filter);

        return { output };
    }
}

export class color_matrix_filter extends filter {
    id: string;
    color_matrix: number[];
    colors_only: boolean;
    
    constructor(id: string, color_matrix?: number[], colors_only?: boolean) {
        super();
        this.id = id;
        this.color_matrix = color_matrix ?? [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
        this.colors_only = colors_only ?? true;
    }
    
    to_fabric_filter() {
        return new filters.ColorMatrix({
            matrix: this.color_matrix,
            colorsOnly: this.colors_only,
        });
    }

    update(filter: color_matrix_filter): void {
        this.color_matrix = filter.color_matrix;
    }

    clone(): filter {
        return new color_matrix_filter(this.id, this.color_matrix, this.colors_only);
    }
}