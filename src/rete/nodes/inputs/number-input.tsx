import { ClassicPreset as classic_preset } from "rete";

import { area } from "../../utils/globals";
import { number_socket } from "../../utils/sockets";
import { process_nodes } from "../../utils/node-compiling";


export class number_input_control extends classic_preset.Control {
  constructor(
    public number: number = 0,
    public node_id?: string,
    public change?: (updated_node_id?: string) => void,
    public readonly: boolean = false,
  ) {
    super();
  }

  setValue(number: number) {
    this.number = number;
    if (this.change) this.change(this.node_id);
  }
}

export function number_input_control_component({ data }: { data: number_input_control }) {
  return (
    <div>
      <input
        type="number"
        className="w-full border rounded-sm border-gray-300 p-1 px-2"
        value={data.number}
        onChange={(e) => {
            if (!data.readonly) {
                data.setValue(Number(e.target.value));
                area.update("control", data.id);
            }
        }}
        onPointerDown={(event) => event.stopPropagation()}
      />
    </div>
  )
}

export class number_node extends classic_preset.Node {
    width = 180;
    height = 170;

  constructor(initial: number = 1, change?: (updated_node_id?: string) => void) {
    super("Number Input");
    this.addControl("value", new number_input_control(initial, this.id, change));
    this.addOutput("value", new classic_preset.Output(number_socket, "Number"));
  }

  data(): { value: number } {
    const control = this.controls.value as number_input_control;
    return { value: Number(control.number) };
  }

  clone() {
    const control = this.controls.value as number_input_control;
    return new number_node(control.number, process_nodes);
  }
}