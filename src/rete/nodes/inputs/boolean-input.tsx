import { ClassicPreset as classic_preset } from "rete";

import { area } from "../../utils/globals";
import { boolean_socket } from "../../utils/sockets";
import { process_nodes } from "../../utils/node-compiling";


export class boolean_input_control extends classic_preset.Control {
  constructor(
    public boolean: boolean = true,
    public node_id?: string,
    public change?: (updated_node_id?: string) => void,
    public readonly: boolean = false,
  ) {
    super();
  }

  setValue(boolean: boolean) {
    this.boolean = boolean;
    if (this.change) this.change(this.node_id);
  }
}

export function boolean_input_control_component({ data }: { data: boolean_input_control }) {
  return (
    <div>
      <button
        className="w-full border border-gray-300 rounded-sm p-1 px-2"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => {
          if (!data.readonly) {
            data.boolean = !data.boolean;
            area.update("control", data.id);
          }
        }}
      >
        {
          data.boolean ? "True" : "False"
        }
      </button>
    </div>
  )
}

export class boolean_node extends classic_preset.Node {
  width = 180;
  height = 170;

  constructor(initial: boolean = true, change?: (updated_node_id?: string) => void) {
    super("Boolean Input");
    this.addControl("value", new boolean_input_control(initial, this.id, change));
    this.addOutput("value", new classic_preset.Output(boolean_socket, "boolean"));
  }

  data(): { value: boolean } {
    const control = this.controls.value as boolean_input_control;
    return { value: control.boolean };
  }

  clone() {
    const control = this.controls.value as boolean_input_control;
    return new boolean_node(control.boolean, process_nodes);
  }
}