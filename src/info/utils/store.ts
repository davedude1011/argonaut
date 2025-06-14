import { create } from "zustand";

interface info_store_t {
    active: boolean;
    set_active: (bool: boolean) => void;
}

export const info_store = create<info_store_t>((set) => ({
    active: false,
    set_active: (bool) => set(() => ({ active: bool })),
}))