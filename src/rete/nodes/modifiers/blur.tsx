import { ClassicPreset } from "rete";

import { number_input_control } from "../inputs/number-input";
import { image_socket, number_socket } from "../../utils/sockets";
import { filter, image_transport } from "../../utils/utils";
import { filters } from "fabric";
import { image_input_control } from "../inputs/image-input";

export class blur_filter_node extends ClassicPreset.Node {
    width = 180;
    height = 230;

    constructor(change?: (updated_node_id?: string) => void) {
        super("Blur - Image Modifier");
        
        const blur = new ClassicPreset.Input(number_socket, "strength");
        blur.addControl(new number_input_control(25, this.id, change));
        this.addInput("blur", blur);
        
        const image = new ClassicPreset.Input(image_socket, "image");
        image.addControl(new image_input_control(undefined, this.id, change));
        this.addInput("image", image);

        const output = new ClassicPreset.Output(image_socket, "image");
        this.addOutput("output", output);
    }

    data(inputs: { blur?: number[], image?: image_transport[] }): { output?: image_transport } {
        const blur_control = this.inputs.blur?.control as number_input_control;
        const blur = inputs.blur?.[0] ?? blur_control.number;

        const image_control = this.inputs.image?.control as image_input_control;
        const image = inputs.image?.[0] ?? image_control.image_transport;

        console.log(blur)

        const filter = new blur_filter(this.id, blur);

        const output = image?.clone();
        output?.filters.push(filter);

        return { output };
    }
}

export class blur_filter extends filter {
    id: string;
    blur: number;
    
    constructor(id: string, blur?: number) {
        super();
        this.id = id;
        this.blur = blur ?? 1;
    }
    
    to_fabric_filter() {
        return new filters.Blur({
            blur: this.blur / 100,
        });
    }

    update(filter: blur_filter): void {
        this.blur = filter.blur;
    }

    clone(): filter {
        return new blur_filter(this.id, this.blur);
    }
}