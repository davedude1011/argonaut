import { ClassicPreset as classic_preset, ClassicPreset } from "rete";
import { image_socket } from "../../utils/sockets";
import { engine } from "../../utils/globals";
import { image_transport } from "../../utils/utils";
import { v4 as uuidv4 } from "uuid";
import { canvas_store } from "../../../konva/utils/store";
import { konva_canvas } from "../../../konva/utils/utils";
import ReactDOM from 'react-dom/client';
import CanvasScreen from "../../../konva/utils/screen";

export class canvas_control extends classic_preset.Control {
  constructor(
    public node_id: string,
  ) {
    super();
  }
}

export function canvas_control_component({ data }: { data: canvas_control }) {
  return (
    <div>
      <button
        className="w-full border border-gray-300 rounded-sm p-1 px-2"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={async() => {
          canvas_store.getState().set_active_canvas(data.node_id);
        }}
      >
        Edit Canvas
      </button>
    </div>
  );
}

export class canvas_node extends classic_preset.Node {
    width = 250;
    height = 280;
    id: string;
    image?: image_transport;
    change?: (updated_node_id?: string) => void;

    constructor(change: (updated_node_id?: string) => void) {
        super("Canvas");

        this.id = uuidv4();
        canvas_store.getState().create_canvas(this.id, new konva_canvas());

        this.change = change;

        this.addControl("canvas", new canvas_control(this.id));

        this.addOutput("image", new ClassicPreset.Output(image_socket, "image"));
    }

    data() {
      return { image: this.image }
    }
}