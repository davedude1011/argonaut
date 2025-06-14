import { ClassicPreset } from "rete";

import { number_input_control } from "../inputs/number-input";
import { image_socket, number_socket } from "../../utils/sockets";
import { filter, image_transport } from "../../utils/utils";
import { filters } from "fabric";
import { image_input_control } from "../inputs/image-input";

export class vibrance_filter_node extends ClassicPreset.Node {
    width = 180;
    height = 230;

    constructor(change?: (updated_node_id?: string) => void) {
        super("Vibrance - Image Modifier");
        
        const vibrance = new ClassicPreset.Input(number_socket, "strength");
        vibrance.addControl(new number_input_control(25, this.id, change));
        this.addInput("vibrance", vibrance);
        
        const image = new ClassicPreset.Input(image_socket, "image");
        image.addControl(new image_input_control(undefined, this.id, change));
        this.addInput("image", image);

        const output = new ClassicPreset.Output(image_socket, "image");
        this.addOutput("output", output);
    }

    data(inputs: { vibrance?: number[], image?: image_transport[] }): { output?: image_transport } {
        const vibrance_control = this.inputs.vibrance?.control as number_input_control;
        const vibrance = inputs.vibrance?.[0] ?? vibrance_control.number;

        const image_control = this.inputs.image?.control as image_input_control;
        const image = inputs.image?.[0] ?? image_control.image_transport;

        console.log(vibrance)

        const filter = new vibrance_filter(this.id, vibrance);

        const output = image?.clone();
        output?.filters.push(filter);

        return { output };
    }
}

export class vibrance_filter extends filter {
    id: string;
    vibrance: number;
    
    constructor(id: string, vibrance?: number) {
        super();
        this.id = id;
        this.vibrance = vibrance ?? 1;
    }
    
    to_fabric_filter() {
        return new filters.Vibrance({
            vibrance: this.vibrance / 50,
        });
    }

    update(filter: vibrance_filter): void {
        this.vibrance = filter.vibrance;
    }

    clone(): filter {
        return new vibrance_filter(this.id, this.vibrance);
    }
}