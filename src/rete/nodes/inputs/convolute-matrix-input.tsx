import { ClassicPreset as classic_preset } from "rete";

import { area } from "../../utils/globals";
import { convolute_matrix_socket } from "../../utils/sockets";
import { process_nodes } from "../../utils/node-compiling";

export class convolute_matrix_input_control extends classic_preset.Control {
  constructor(
    public matrix: number[] = [0, 0, 0, 0, 1, 0, 0, 0, 0],
    public node_id?: string,
    public change?: (updated_node_id?: string) => void,
    public readonly: boolean = false,
  ) {
    super();
  }

  setValue(matrix: number[]) {
    this.matrix = matrix;
    if (this.change) this.change(this.node_id);
  }
}

export function convolute_matrix_input_control_component({ data }: { data: convolute_matrix_input_control }) {
  return (
    <div className="flex flex-col gap-2">
      {
        Array.from({ length: 3 }, (_, i) => data.matrix.slice(i * 3, i * 3 + 3)).map((row, row_index) => (
          <div className="flex flex-row gap-2" key={row_index}>
            {
              row.map((cell, cell_index) => (
                <div key={`${row_index}x${cell_index}`}>
                  <input
                    type="number"
                    className="border rounded-sm border-gray-300 w-20 h-20 p-2 text-center"
                    value={cell}
                    onChange={(e) => {
                      if (!data.readonly) {
                        const matrix = [...data.matrix];
                        matrix[row_index * 3 + cell_index] = Number(e.target.value);
                        
                        data.setValue(matrix);
                        area.update("control", data.id);
                      }
                    }}
                    onPointerDown={(event) => event.stopPropagation()}
                  />
                </div>
              ))
            }
          </div>
        ))
      }
    </div>
  )
}

export class convolute_matrix_node extends classic_preset.Node {
    width = 300;
    height = 390;

  constructor(initial: number[] = [0, 0, 0, 0, 1, 0, 0, 0, 0], change?: (updated_node_id?: string) => void) {
    super("Convuolute Matrix Input");
    this.addControl("convolute_matrix", new convolute_matrix_input_control(initial, this.id, change));
    this.addOutput("convolute_matrix", new classic_preset.Output(convolute_matrix_socket, "convolute matrix"));
  }

  data(): { convolute_matrix: number[] } {
    const control = this.controls.convolute_matrix as convolute_matrix_input_control;
    return { convolute_matrix: control.matrix };
  }

  clone() {
    const control = this.controls.convolute_matrix as convolute_matrix_input_control;
    return new convolute_matrix_node(control.matrix, process_nodes);
  }
}