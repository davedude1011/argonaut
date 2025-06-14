import { ClassicPreset } from "rete";

import { number_input_control } from "../inputs/number-input";
import { image_socket, number_socket } from "../../utils/sockets";
import { filter, image_transport } from "../../utils/utils";
import { filters } from "fabric";
import { image_input_control } from "../inputs/image-input";

export class brightness_filter_node extends ClassicPreset.Node {
    width = 180;
    height = 230;

    constructor(change?: (updated_node_id?: string) => void) {
        super("Brightness - Image Modifier");
        
        const brightness = new ClassicPreset.Input(number_socket, "strength");
        brightness.addControl(new number_input_control(25, this.id, change));
        this.addInput("brightness", brightness);
        
        const image = new ClassicPreset.Input(image_socket, "image");
        image.addControl(new image_input_control(undefined, this.id, change));
        this.addInput("image", image);

        const output = new ClassicPreset.Output(image_socket, "image");
        this.addOutput("output", output);
    }

    data(inputs: { brightness?: number[], image?: image_transport[] }): { output?: image_transport } {
        const brightness_control = this.inputs.brightness?.control as number_input_control;
        const brightness = inputs.brightness?.[0] ?? brightness_control.number;

        const image_control = this.inputs.image?.control as image_input_control;
        const image = inputs.image?.[0] ?? image_control.image_transport;

        const filter = new brightness_filter(this.id, brightness);
        
        const output = image?.clone();
        output?.filters.push(filter);

        return { output };
    }
}

export class brightness_filter extends filter {
    id: string;
    brightness: number;
    
    constructor(id: string, brightness?: number) {
        super();
        this.id = id;
        this.brightness = brightness ?? 1;
    }
    
    to_fabric_filter() {
        return new filters.Brightness({
            brightness: this.brightness / 100,
        });
    }

    update(filter: brightness_filter): void {
        this.brightness = filter.brightness;
    }

    clone(): filter {
        return new brightness_filter(this.id, this.brightness);
    }
}