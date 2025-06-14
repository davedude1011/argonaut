import { filters } from 'fabric';
import { node_store } from './store';

import { save } from '@tauri-apps/plugin-dialog';
import { downloadDir } from '@tauri-apps/api/path';
import { writeFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { konva_image } from '../../konva/utils/utils';

type any_filter = 
                | filters.BlendColor
                | filters.BlendImage
                | filters.Blur
                | filters.Brightness
                | filters.ColorMatrix
                | filters.Contrast
                | filters.Convolute
                | filters.Gamma
                | filters.Grayscale
                | filters.HueRotation
                | filters.Invert
                | filters.Noise
                | filters.Pixelate
                | filters.RemoveColor
                | filters.Saturation

export abstract class filter {
    abstract id: string;
    abstract to_fabric_filter(): any_filter;
    abstract update(filter: filter): void;
    abstract clone(): filter;
}

export class image_transport {
    image_id: string;
    filters: filter[];
    height: number;
    width: number;

    constructor(image_id: string, filters?: filter[]) {
        this.image_id = image_id;
        this.filters = filters ?? [];

        const fabric_image = node_store.getState().images[this.image_id];
        this.width = fabric_image.width;
        this.height = fabric_image.height;
    }

    generate_canvas() {
        const fabric_image = this.get_fabric_image();
        if (!fabric_image) return null;

        fabric_image.filters = this.filters.map((filter) => filter.to_fabric_filter());
        fabric_image.applyFilters();

        const canvas = fabric_image.toCanvasElement();

        return canvas;
    }

    draw_to_canvas(targetCanvas: HTMLCanvasElement) {
        const sourceCanvas = this.generate_canvas();
        if (!sourceCanvas) return;

        const ctx = targetCanvas.getContext("2d");
        if (!ctx) return;

        // Resize target canvas to match source
        targetCanvas.width = this.width;
        targetCanvas.height = this.height;
        targetCanvas.style.width = "100%";
        targetCanvas.style.height = "auto";

        ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
        ctx.drawImage(sourceCanvas, 0, 0);
    }

    get_fabric_image() {
        const fabric_image = node_store.getState().images[this.image_id];
        return fabric_image;
    }

    clone() {
        const clone = new image_transport(this.image_id, this.filters.map((filter) => filter.clone()));
        return clone;
    }

    to_konva_image(): konva_image | undefined {
        const canvas = this.generate_canvas();
        if (!canvas) return;

        const obj = new konva_image({
            image: canvas
        });
        return obj;
    }

    async save_image(format: 'png' | 'jpeg' | 'webp') {
        const canvas = this.generate_canvas();
        if (!canvas) return;

        console.log(1)

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, `image/${format}`)
        );
        if (!blob) return;

        const array_buffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(array_buffer);

        const default_path = `${await downloadDir()}/${this.image_id}.${format}`;

        const path = await save({
            defaultPath: default_path,
            filters: [{ name: format.toUpperCase(), extensions: [format] }],
        });

        if (path) {
            await writeFile(path, bytes);
        }
    }

    async save_base64() {
        const canvas = this.generate_canvas();
        if (!canvas) return;

        const base64 = canvas.toDataURL('image/png'); // default to PNG base64
        const default_path = `${await downloadDir()}/${this.image_id}_base64.txt`;

        const path = await save({
            defaultPath: default_path,
            filters: [{ name: 'Text File', extensions: ['txt'] }],
        });

        if (path) {
            await writeTextFile(path, base64);
        }
    }

    async save_bitmap() {
        const canvas = this.generate_canvas();
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const bitmap_array = Array.from(image_data.data);
        const bitmap_string = JSON.stringify(bitmap_array);

        const default_path = `${await downloadDir()}/${this.image_id}_bitmap.txt`;

        const path = await save({
            defaultPath: default_path,
            filters: [{ name: 'Text File', extensions: ['txt'] }],
        });

        if (path) {
            await writeTextFile(path, bitmap_string);
        }
    }
}