import { ClassicPreset as classic_preset } from "rete";

import { area } from "../../utils/globals";
import { rgb_matrix_socket } from "../../utils/sockets";
import { process_nodes } from "../../utils/node-compiling";

export class rgb_matrix_input_control extends classic_preset.Control {
  constructor(
    public matrix: [number, number, number] = [1, 1, 1],
    public node_id?: string,
    public change?: (updated_node_id?: string) => void,
    public readonly: boolean = false,
  ) {
    super();
  }

  setValue(matrix: [number, number, number]) {
    this.matrix = matrix;
    if (this.change) this.change(this.node_id);
  }
}

export function rgb_matrix_input_control_component({ data }: { data: rgb_matrix_input_control }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        {
          data.matrix.map((cell, index) => (
            <div key={index}>
              <input
                type="number"
                className="border border-gray-300 rounded-sm w-20 h-20 p-2 text-center"
                value={cell}
                onChange={(e) => {
                  if (!data.readonly) {
                    const matrix = [...data.matrix];
                    matrix[index] = Number(e.target.value);
                    data.setValue(matrix as [number, number, number]);
                    area.update("control", data.id);
                  }
                }}
                onPointerDown={(event) => event.stopPropagation()}
              />
            </div>
          ))
        }
      </div>
    </div>
  );
}

export class rgb_matrix_node extends classic_preset.Node {
  width = 300;
  height = 210;

  constructor(initial: [number, number, number] = [1, 1, 1], change?: (updated_node_id?: string) => void) {
    super("RGB Matrix Input");
    this.addControl("rgb_matrix", new rgb_matrix_input_control(initial, this.id, change));
    this.addOutput("rgb_matrix", new classic_preset.Output(rgb_matrix_socket, "rgb matrix"));
  }

  data(): { rgb_matrix: [number, number, number] } {
    const control = this.controls.rgb_matrix as rgb_matrix_input_control;
    return { rgb_matrix: control.matrix as [number, number, number] };
  }

  clone() {
    const control = this.controls.rgb_matrix as rgb_matrix_input_control;
    return new rgb_matrix_node(control.matrix, process_nodes);
  }
}
