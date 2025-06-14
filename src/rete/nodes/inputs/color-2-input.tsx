import { ClassicPreset as classic_preset } from "rete";

import { area } from "../../utils/globals";
import { color_socket } from "../../utils/sockets";

import { ChromePicker } from 'react-color';
import { process_nodes } from "../../utils/node-compiling";


export class color_2_input_control extends classic_preset.Control {
  constructor(
    public color: string = "#ffffff",
    public node_id?: string,
    public change?: (updated_node_id?: string) => void,
    public readonly: boolean = false,
  ) {
    super();
  }

  setValue(color: string) {
    this.color = color;
    if (this.change) this.change(this.node_id);
  }
}

export function color_2_input_control_component({ data }: { data: color_2_input_control }) {
  return (
    <div onPointerDown={(event) => event.stopPropagation()}>
      <ChromePicker
        className="w-full"
        color={data.color}
        onChange={(e) => {
            if (!data.readonly) {
              console.log(e.hex)
                data.setValue(e.hex);
                area.update("control", data.id);
            }
        }}
        disableAlpha={true}
      />
    </div>
  )
}

export class color_2_node extends classic_preset.Node {
    width = 260;
    height = 355;

  constructor(initial: string = "#ffffff", change?: (updated_node_id?: string) => void) {
    super("Color Input 2");
    this.addControl("value", new color_2_input_control(initial, this.id, change));
    this.addOutput("value", new classic_preset.Output(color_socket, "Color"));
  }

  data(): { value: string } {
    const control = this.controls.value as color_2_input_control;
    return { value: control.color };
  }

  clone() {
    const control = this.controls.value as color_2_input_control;
    return new color_2_node(control.color, process_nodes);
  }
}