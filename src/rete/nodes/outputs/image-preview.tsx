import { useRef } from "react";

import { ClassicPreset as classic_preset, ClassicPreset } from "rete";
import { image_socket } from "../../utils/sockets";
import { area } from "../../utils/globals";
import { image_transport } from "../../utils/utils";
import { v4 as uuidv4 } from "uuid";
import { image_input_control } from "../inputs/image-input";

export class image_preview_control extends classic_preset.Control {
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

export function image_preview_control_component({ data }: { data: image_preview_control }) {
  const canvas_ref = useRef<HTMLCanvasElement>(null);

  const update_canvas = () => {
    if (!data.image) return;
    if (!canvas_ref.current) return;

    data.image.draw_to_canvas(canvas_ref.current);
  }
  update_canvas();

  return <canvas ref={canvas_ref} />;
}

export class image_preview_node extends classic_preset.Node {
    width = 250;
    height = 280;
    id: string;

    constructor(change?: (updated_node_id?: string) => void) {
        super("Image Preview");

        this.id = uuidv4();

        const image = new ClassicPreset.Input(image_socket, "image");
        image.addControl(new image_input_control(undefined, this.id, change));
        this.addInput("image", image);
        
        const preview = new image_preview_control();
        this.addControl("preview", preview);
    }

    data(inputs: { image?: image_transport[] }) {
      const image_control = this.inputs.image?.control as image_input_control;
      const image = inputs.image?.[0] ?? image_control.image_transport;
      
      if (!image) return;

      const preview_control = this.controls.preview as image_preview_control;
      
      // Define constants for clarity
      const NODE_PADDING = 20; // Total horizontal padding
      const HEADER_HEIGHT = 60; // Title + input socket area
      const CONTROLS_HEIGHT = 60; // Bottom controls/padding
      const MAX_IMAGE_HEIGHT = 400; // Prevent extremely tall nodes
      const MIN_IMAGE_HEIGHT = 100; // Prevent tiny images
      
      const available_width = this.width - NODE_PADDING;
      const image_ratio = image.height / image.width;
      let calculated_image_height = available_width * image_ratio;
      
      // Clamp the image height
      calculated_image_height = Math.max(MIN_IMAGE_HEIGHT, 
                                      Math.min(MAX_IMAGE_HEIGHT, calculated_image_height));
      
      this.height = calculated_image_height + HEADER_HEIGHT + CONTROLS_HEIGHT;
      
      area.update("node", this.id);
      preview_control.setValue(image);
    }
}