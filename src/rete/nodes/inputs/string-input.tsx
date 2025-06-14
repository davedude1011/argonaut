import { ClassicPreset as classic_preset } from "rete";

import { area } from "../../utils/globals";
import { string_socket } from "../../utils/sockets";
import { process_nodes } from "../../utils/node-compiling";


export class string_input_control extends classic_preset.Control {
  constructor(
    public string: string = "",
    public node_id?: string,
    public change?: (updated_node_id?: string) => void,
    public readonly: boolean = false,
  ) {
    super();
  }

  setValue(string: string) {
    this.string = string;
    if (this.change) this.change(this.node_id);
  }
}

export function string_input_control_component({ data }: { data: string_input_control }) {
  return (
    <div>
      <input
        type="text"
        className="w-full border rounded-sm border-gray-300 p-1 px-2"
        value={data.string}
        onChange={(e) => {
            if (!data.readonly) {
                data.setValue(e.target.value);
                area.update("control", data.id);
            }
        }}
        onPointerDown={(event) => event.stopPropagation()}
      />
    </div>
  )
}

export class string_node extends classic_preset.Node {
    width = 180;
    height = 170;

  constructor(initial: string = "", change?: (updated_node_id?: string) => void) {
    super("String Input");
    this.addControl("value", new string_input_control(initial, this.id, change));
    this.addOutput("value", new classic_preset.Output(string_socket, "string"));
  }

  data(): { value: string } {
    const control = this.controls.value as string_input_control;
    return { value: control.string };
  }

  clone() {
    const control = this.controls.value as string_input_control;
    return new string_node(control.string, process_nodes);
  }
}