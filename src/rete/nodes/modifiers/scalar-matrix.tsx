import { ClassicPreset } from "rete";

import { general_matrix, number_socket } from "../../utils/sockets";
import { number_input_control } from "../inputs/number-input";

export class scalar_matrix_node extends ClassicPreset.Node {
    width = 180;
    height = 240;

    constructor(change?: (updated_node_id?: string) => void) {
        super("Scalar Matrix - Matrix Modifier");
        
        const matrix = new ClassicPreset.Input(general_matrix, "matrix");
        this.addInput("matrix", matrix);

        const scalar = new ClassicPreset.Input(number_socket, "scalar");
        scalar.addControl(new number_input_control(1, this.id, change));
        this.addInput("scalar", scalar);

        const output = new ClassicPreset.Output(general_matrix, "matrix");
        this.addOutput("output", output);
    }

    data(inputs: { matrix?: number[][], scalar?: number[] }): { output?: number[] } {
        const matrix = inputs.matrix?.[0];

        if (!matrix) return { output: undefined };

        const scalar_control = this.inputs.scalar?.control as number_input_control;
        const scalar = inputs.scalar?.[0] ?? scalar_control.number;

        return { output: matrix.map((cell) => cell * scalar) };
    }
}