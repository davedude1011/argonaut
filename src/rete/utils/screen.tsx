import { useRete } from "rete-react-plugin";
import { init_editor } from "./editor";
import NodeToolbar from "../ui/toolbar";

export default function NodeScreen() {
  const [ref] = useRete(init_editor);
  
  return (
    <div className="absolute w-screen h-screen z-10">
      <NodeToolbar />
      <div ref={ref} className="w-screen h-screen"></div>
    </div>
  )
}