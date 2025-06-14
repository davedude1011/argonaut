import Konva from "konva";

export class konva_image extends Konva.Image {
    constructor(config: Konva.ImageConfig) {
        super(config);
    }
}

export class konva_object extends Konva.Rect {
    constructor(config: Konva.RectConfig) {
        super(config);
    }
}

export class konva_canvas {
    images: konva_image[];
    objects: konva_object[];

    constructor() {
        this.images = [];
        this.objects = [];
    }
}