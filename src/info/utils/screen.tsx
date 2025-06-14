import { ArrowLeft, ArrowLeftToLine, Home, X } from "lucide-react";
import { info_store } from "./store";

export default function InfoScreen() {
    return (
        <div className="absolute z-50 bg-[#242424] w-screen h-screen flex flex-col items-center">
            <div className="max-w-[800px] w-full flex flex-row justify-between items-center">
                <div>
                    <div className="text-3xl text-white pt-4">
                        Argonaut
                    </div>
                    <div className="italic pb-4 text-white font-thin">
                        A node-based image editor for procedural workflows
                    </div>
                </div>
                <div className="text-white cursor-pointer">
                    <X onClick={() => info_store.getState().set_active(false)} />
                </div>
            </div>
            <div className="text-gray-300 max-w-[800px] text-justify flex flex-col gap-4 p-4z">
                <div>
                    <b>Argonaut</b> is a node-based image editor enabling non-destructive, procedural image manipulation through a visual graph interface. Built on Rete.js, it allows users to construct complex editing pipelines by connecting nodes representing operations like Fabric.js filters, custom matrix transformations, and scalar adjustments. Every node maintains its own state and provides real-time previews, enabling flexible branching, experimentation, and undo/redo-safe workflows without altering original source assets.
                </div>
                <div>
                    For spatial tasks beyond nodes – such as compositing, transforming, or arranging multiple elements – Argonaut integrates dedicated Konva-powered canvas nodes. These act as self-contained workspaces where you position, scale, and rotate imported assets from your graph. Upon exiting, the canvas state is intentionally baked into the node, creating a stable foundation for further non-destructive filtering or export. Final outputs can be rendered to PNG, JPG, WebP, Bitmap, or Base64 formats at any stage in your pipeline.
                </div>
                <div className="flex flex-col">
                    <div>
                        Built by <a className="text-blue-500" target="_blank" href="https://www.github.com/davedude1011">Davedude101</a>
                    </div>
                    <div className="text-gray-400 text-xs italic text-end">
                        v0.1 · <a className="underline" href="https://github.com/davedude1011/argonaut" target="_blank">Github</a> · MIT License · rete.js / fabric.js / konva
                    </div>
                </div>
            </div>
        </div>
    )
}