import InfoScreen from "./info/utils/screen";
import { info_store } from "./info/utils/store";
import CanvasScreen from "./konva/utils/screen";
import { canvas_store } from "./konva/utils/store";
import NodeScreen from "./rete/utils/screen";

export default function Page() {
  const store = canvas_store();
  const info = info_store();

  return (
    <div className="w-full h-full">
      {
        info.active && <InfoScreen />
      }
      {
        store.active_canvas && <CanvasScreen />
      }
      <NodeScreen />
    </div>
  )
}