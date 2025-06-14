import { ClassicPreset as classic_preset, ClassicPreset } from "rete";
import { image_socket } from "../../utils/sockets";
import { engine } from "../../utils/globals";
import { image_transport } from "../../utils/utils";
import { v4 as uuidv4 } from "uuid";

export class webp_download_control extends classic_preset.Control {
  constructor(
    public image?: image_transport,
    public node_id?: string,
    public change?: (updated_node_id?: string) => void,
  ) {
    super();
  }

  setValue(image: image_transport) {
    this.image = image;
    if (this.change) this.change(this.node_id);
  }
}

export function webp_download_control_component({ data }: { data: webp_download_control }) {
  return (
    <div>
      <button
        className="w-full border border-gray-300 rounded-sm p-1 px-2"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={async() => {
          const { image } = await engine.fetchInputs(data.node_id ?? "");
          if (!image ) return;

          image[0].save_image("webp");
        }}
      >
        Download WEBP
      </button>
    </div>
  );
}

export class webp_download_node extends classic_preset.Node {
    width = 250;
    height = 280;
    id: string;

    constructor(change?: (updated_node_id?: string) => void) {
        super("WEBP export");

        this.id = uuidv4();

        this.addControl("download", new webp_download_control(undefined, this.id, change));

        this.addInput("image", new ClassicPreset.Input(image_socket, "image"));
    }

    data(inputs: { image?: image_transport[] }) {
      const image = inputs.image?.[0];
      if (!image) return;

      const download_control = this.controls.download as webp_download_control;
      download_control.setValue(image);
    }
}