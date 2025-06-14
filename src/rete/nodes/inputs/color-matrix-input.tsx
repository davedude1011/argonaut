import { ClassicPreset as classic_preset } from "rete";

import { area } from "../../utils/globals";
import { color_matrix_socket } from "../../utils/sockets";
import { process_nodes } from "../../utils/node-compiling";


export class color_matrix_input_control extends classic_preset.Control {
  constructor(
    public matrix: number[] = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
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

export function color_matrix_input_control_component({ data }: { data: color_matrix_input_control }) {
  return (
    <div className="flex flex-col gap-2">
      {
        Array.from({ length: 4 }, (_, i) => data.matrix.slice(i * 5, i * 5 + 5)).map((row, row_index) => (
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
                        matrix[row_index * 5 + cell_index] = Number(e.target.value);
                        
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

export class color_matrix_node extends classic_preset.Node {
    width = 470;
    height = 480;

  constructor(initial: number[] = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], change?: (updated_node_id?: string) => void) {
    super("Color Matrix Input");
    this.addControl("color_matrix", new color_matrix_input_control(initial, this.id, change));
    this.addOutput("color_matrix", new classic_preset.Output(color_matrix_socket, "color matrix"));
  }

  data(): { color_matrix: number[] } {
    const control = this.controls.color_matrix as color_matrix_input_control;
    return { color_matrix: control.matrix };
  }
  
  clone() {
    const control = this.controls.color_matrix as color_matrix_input_control;
    return new color_matrix_node(control.matrix, process_nodes);
  }
}