import { create } from "zustand";
import { konva_canvas, konva_image, konva_object } from "./utils";

const VALID_ANCHORS = [
  'top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right',
];

interface canvas_store_t {
    canvases: Record<string, konva_canvas>,
    create_canvas: (id: string, canvas: konva_canvas) => void;

    active_canvas: string | null;
    set_active_canvas: (id: string | null) => void;

    push_image_to_active_canvas: (image: konva_image) => void;
    push_object_to_active_canvas: (object: konva_object) => void;

    enabled_anchors: string[];
    toggle_anchor: (anchor: string) => void;

    rotation_increment: number;
    set_rotation_increment: (increment: number) => void;

    smart_guides: boolean;
    set_smart_guides: (bool: boolean) => void;

    grid: boolean;
    set_grid: (bool: boolean) => void;
}

export const canvas_store = create<canvas_store_t>((set, get) => ({
    canvases: {},
    create_canvas: (id, canvas) => set((state) => ({canvases: {...state.canvases, [id]: canvas}})),

    active_canvas: null,
    set_active_canvas: (id) => set(() => ({active_canvas: id})),

    push_image_to_active_canvas: (image) => {
        const state = get();
        const id = state.active_canvas;
        if (!id || !state.canvases[id]) return;

        const old_canvas = state.canvases[id];

        set({
            canvases: {
                ...state.canvases,
                [id]: {
                    ...old_canvas,
                    images: [...(old_canvas.images ?? []), image],
                },
            },
        });
    },

    push_object_to_active_canvas: (object) => {
        const state = get();
        const id = state.active_canvas;
        if (!id || !state.canvases[id]) return;

        const old_canvas = state.canvases[id];

        set({
            canvases: {
                ...state.canvases,
                [id]: {
                    ...old_canvas,
                    objects: [...(old_canvas.objects ?? []), object],
                },
            },
        });
    },

    enabled_anchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'bottom-middle'],
    toggle_anchor: (anchor) => set((state) => {
        if (!VALID_ANCHORS.includes(anchor)) return {}; // ignore invalid

        const enabled = state.enabled_anchors.includes(anchor);

        return {
            enabled_anchors: enabled
            ? state.enabled_anchors.filter(a => a !== anchor) // remove
            : [...state.enabled_anchors, anchor], // add
        };
    }),

    rotation_increment: 90,
    set_rotation_increment: (increment) => set(() => ({ rotation_increment: increment })),

    smart_guides: true,
    set_smart_guides: (bool) => set(() => ({ smart_guides: bool })),

    grid: false,
    set_grid: (bool) => set(() => ({ grid: bool })),
}))