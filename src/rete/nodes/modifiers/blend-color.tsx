import { ClassicPreset } from "rete";

import { number_input_control } from "../inputs/number-input";
import { color_socket, image_socket, number_socket, select_socket } from "../../utils/sockets";
import { filter, image_transport } from "../../utils/utils";
import { filters } from "fabric";
import { color_input_control } from "../inputs/color-input";
import { image_input_control } from "../inputs/image-input";
import { select_input_control } from "../inputs/select-input";

export class blend_color_filter_node extends ClassicPreset.Node {
    width = 180;
    height = 350;

    constructor(change?: (updated_node_id?: string) => void) {
        super("Blend Color - Image Modifier");

        const color = new ClassicPreset.Input(color_socket, "color");
        color.addControl(new color_input_control("#ffffff", this.id, change));
        this.addInput("color", color);

        const mode = new ClassicPreset.Input(select_socket, "mode");
        mode.addControl(new select_input_control("multiply", ["multiply", "add", "difference", "screen", "subtract", "darken", "lighten", "overlay", "exclusion", "tint"], this.id, change));
        this.addInput("mode", mode);

        const alpha = new ClassicPreset.Input(number_socket, "alpha");
        alpha.addControl(new number_input_control(100, this.id, change));
        this.addInput("alpha", alpha);

        const image = new ClassicPreset.Input(image_socket, "image");
        image.addControl(new image_input_control(undefined, this.id, change));
        this.addInput("image", image);

        const output = new ClassicPreset.Output(image_socket, "image");
        this.addOutput("output", output);
    }

    data(inputs: { color?: string[], mode?: string[], alpha?: number[], image?: image_transport[] }): { output?: image_transport } {
        const color_control = this.inputs.color?.control as color_input_control;
        const color = inputs.color?.[0] ?? color_control.color;
        
        const mode_control = this.inputs.mode?.control as select_input_control;
        const mode = (inputs.mode?.[0] ?? mode_control.select) as blend_color_mode_t;

        const alpha_control = this.inputs.alpha?.control as number_input_control;
        const alpha = inputs.alpha?.[0] ?? alpha_control.number;

        const image_control = this.inputs.image?.control as image_input_control;
        const image = inputs.image?.[0] ?? image_control.image_transport;

        const blend_color = new blend_color_filter(this.id, color, mode, alpha);

        const output = image?.clone();
        output?.filters.push(blend_color);

        return { output };
    }
}

export type blend_color_mode_t =
  | 'multiply'
  | 'add'
  | 'difference'
  | 'screen'
  | 'subtract'
  | 'darken'
  | 'lighten'
  | 'overlay'
  | 'exclusion'
  | 'tint';

export class blend_color_filter extends filter {
    id: string;
    color: string;
    mode: blend_color_mode_t;
    alpha: number;
    
    constructor(id: string, color?: string, mode?: blend_color_mode_t, alpha?: number) {
        super();
        this.id = id;
        this.color = color ?? "#ffffff";
        this.mode = mode ?? "multiply";
        this.alpha = alpha ?? 100;
    }
    
    to_fabric_filter() {
        return new filters.BlendColor({
            color: this.color,
            mode: this.mode,
            alpha: this.alpha / 100,
        });
    }

    update(filter: blend_color_filter): void {
        this.color = filter.color;
        this.mode = filter.mode;
        this.alpha = filter.alpha;
    }

    clone(): filter {
        return new blend_color_filter(this.id, this.color, this.mode, this.alpha);
    }
}