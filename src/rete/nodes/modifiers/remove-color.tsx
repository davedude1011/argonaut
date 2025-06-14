import { ClassicPreset } from "rete";

import { number_input_control } from "../inputs/number-input";
import { color_socket, image_socket, number_socket } from "../../utils/sockets";
import { filter, image_transport } from "../../utils/utils";
import { filters } from "fabric";
import { color_input_control } from "../inputs/color-input";
import { image_input_control } from "../inputs/image-input";

export class remove_color_filter_node extends ClassicPreset.Node {
    width = 180;
    height = 350;

    constructor(change?: (updated_node_id?: string) => void) {
        super("Remove Color - Image Modifier");

        const color = new ClassicPreset.Input(color_socket, "color");
        color.addControl(new color_input_control("#ffffff", this.id, change));
        this.addInput("color", color);

        const distance = new ClassicPreset.Input(number_socket, "distance");
        distance.addControl(new number_input_control(2, this.id, change));
        this.addInput("distance", distance);

        const image = new ClassicPreset.Input(image_socket, "image");
        image.addControl(new image_input_control(undefined, this.id, change));
        this.addInput("image", image);

        const output = new ClassicPreset.Output(image_socket, "image");
        this.addOutput("output", output);
    }

    data(inputs: { color?: string[], mode?: string[], distance?: number[], image?: image_transport[] }): { output?: image_transport } {
        const color_control = this.inputs.color?.control as color_input_control;
        const color = inputs.color?.[0] ?? color_control.color;

        const distance_control = this.inputs.distance?.control as number_input_control;
        const distance = inputs.distance?.[0] ?? distance_control.number;

        const image_control = this.inputs.image?.control as image_input_control;
        const image = inputs.image?.[0] ?? image_control.image_transport;

        const remove_color = new remove_color_filter(this.id, color, distance);

        const output = image?.clone();
        output?.filters.push(remove_color);

        return { output };
    }
}

export class remove_color_filter extends filter {
    id: string;
    color: string;
    distance: number;
    
    constructor(id: string, color?: string, distance?: number) {
        super();
        this.id = id;
        this.color = color ?? "#ffffff";
        this.distance = distance ?? 100;
    }
    
    to_fabric_filter() {
        return new filters.RemoveColor({
            color: this.color,
            distance: this.distance / 100,
        });
    }

    update(filter: remove_color_filter): void {
        this.color = filter.color;
        this.distance = filter.distance;
    }

    clone(): filter {
        return new remove_color_filter(this.id, this.color, this.distance);
    }
}