import { ClassicPreset as classic_preset } from "rete";

import { area } from "../../utils/globals";
import { select_socket } from "../../utils/sockets";
import { process_nodes } from "../../utils/node-compiling";


export class select_input_control extends classic_preset.Control {
  constructor(
    public select: string,
    public options: string[],
    public node_id?: string,
    public change?: (updated_node_id?: string) => void,
    public readonly: boolean = false,
  ) {
    super();
  }

  setValue(select: string) {
    this.select = select;
    if (this.change) this.change(this.node_id);
  }
}

export function select_input_control_component({ data }: { data: select_input_control }) {
  return (
    <div onPointerDown={(event) => event.stopPropagation()}>
      <select className="w-full border rounded-sm border-gray-300 p-1 px-2 bg-transparent text-center italic appearance-none" value={data.select} onChange={(e) => {
            if (!data.readonly) {
                data.setValue(e.target.value);
                area.update("control", data.id);
            }
      }}>
        {
          data.options.map((option) => (
            <option key={option}>{option}</option>
          ))
        }
      </select>
    </div>
  )
}

export class select_node extends classic_preset.Node {
    width = 180;
    height = 170;

  constructor(initial: string, options: string[], change?: (updated_node_id?: string) => void) {
    super("Select Input");
    this.addControl("value", new select_input_control(initial, options, this.id, change));
    this.addOutput("value", new classic_preset.Output(select_socket, "select"));
  }

  data(): { value: string } {
    const control = this.controls.value as select_input_control;
    return { value: control.select };
  }

  clone() {
    const control = this.controls.value as select_input_control;
    return new select_node(control.select, control.options, process_nodes);
  }
}