import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Transformer, Image as KonvaImage, Rect } from 'react-konva';
import Konva from 'konva';
import { editor } from '../../rete/utils/globals';
import { image_transport } from '../../rete/utils/utils';
import { canvas_store } from './store';
import CanvasToolbar from '../ui/toolbar';
import { node_store } from '../../rete/utils/store';
import { FabricImage } from 'fabric';

export default function CanvasScreen() {
  const store = canvas_store();
  const canvasData = store.active_canvas != null ? store.canvases[store.active_canvas] : null;

  const transformerRef = useRef(null);
  const imageRefs = useRef([]);
  const objectRefs = useRef([]);
  const [selectedIdx, setSelectedIdx] = useState(null);

  // viewport pan/zoom state
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const isPanning = useRef(false);
  const lastDist = useRef({ x: 0, y: 0 });

  // attach transformer to selected node
  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    const allRefs = [...imageRefs.current, ...objectRefs.current];
    const node = selectedIdx != null ? allRefs[selectedIdx] : null;
    transformer.nodes(node ? [node] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedIdx]);

  const handleSave = useCallback(async () => {
    const stage = transformerRef.current?.getStage();
    if (!stage) return;
    const layer = stage.getLayers()[0];
    const images = layer.find(node => node.className === 'Image');
    if (!images.length) return;
    const boxes = images.map(img => img.getClientRect());
    const { x, y, width, height } = boxes.reduce((a, b) => ({
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      width: Math.max(a.x + a.width, b.x + b.width) - Math.min(a.x, b.x),
      height: Math.max(a.y + a.height, b.y + b.height) - Math.min(a.y, b.y),
    }));

    const dataURL = stage.toDataURL({ x, y, width, height, pixelRatio: 2 });
    const img = await FabricImage.fromURL(dataURL);
    node_store.getState().set_image(store.active_canvas, img);
    const transport = new image_transport(store.active_canvas);
    const canvasNode = editor.getNode(store.active_canvas);
    canvasNode.image = transport;
    canvasNode.change();
  }, [store.active_canvas]);

  // snapping drag move
  const handleDragMove = useCallback((e, idx) => {
    if (!store.smart_guides) return;
    const target = e.target;
    const layer = target.getLayer();
    const stage = target.getStage();
    if (!stage || !layer) return;
    const GUIDELINE_OFFSET = 5;
    const absPos = target.absolutePosition();
    const box = target.getClientRect();

    const vertical = [0, stage.width() / 2, stage.width()];
    const horizontal = [0, stage.height() / 2, stage.height()];
    [...imageRefs.current, ...objectRefs.current].forEach((ref, j) => {
      if (j === idx || !ref) return;
      const rBox = ref.getClientRect();
      vertical.push(rBox.x, rBox.x + rBox.width, rBox.x + rBox.width / 2);
      horizontal.push(rBox.y, rBox.y + rBox.height, rBox.y + rBox.height / 2);
    });

    const snaps = { V: [], H: [] };
    vertical.forEach(line => {
      [box.x, box.x + box.width / 2, box.x + box.width].forEach(edge => {
        if (Math.abs(line - edge) < GUIDELINE_OFFSET) snaps.V.push({ line, offset: absPos.x - edge });
      });
    });
    horizontal.forEach(line => {
      [box.y, box.y + box.height / 2, box.y + box.height].forEach(edge => {
        if (Math.abs(line - edge) < GUIDELINE_OFFSET) snaps.H.push({ line, offset: absPos.y - edge });
      });
    });

    layer.find('.guideline').forEach(l => l.destroy());
    snaps.V.forEach(s => {
      layer.add(new Konva.Line({ points: [s.line, -1000, s.line, 1000], stroke: 'white', dash: [4, 4], name: 'guideline' }));
      absPos.x = s.line + s.offset;
    });
    snaps.H.forEach(s => {
      layer.add(new Konva.Line({ points: [-1000, s.line, 1000, s.line], stroke: 'white', dash: [4, 4], name: 'guideline' }));
      absPos.y = s.line + s.offset;
    });

    target.absolutePosition(absPos);
  }, [store.smart_guides]);

  const handleDragEnd = useCallback((e, dataItem) => {
    e.target.getLayer()?.find('.guideline').forEach(l => l.destroy());
    const { x, y } = e.target.position();
    dataItem.position({ x, y });
  }, []);

  const handleTransformEnd = useCallback((e, dataItem) => {
    const node = e.currentTarget;
    dataItem.rotation(node.rotation());
    dataItem.scale({ x: node.scaleX(), y: node.scaleY() });
    dataItem.position({ x: node.x(), y: node.y() });
  }, []);

  const handleSelect = useCallback(idx => setSelectedIdx(idx), []);

  const handleWheel = useCallback(e => {
    e.evt.preventDefault();
    const stage = e.target.getStage(); if (!stage) return;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition(); if (!pointer) return;
    const scaleBy = 1.05;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setScale(newScale);
    setStagePos(newPos);
  }, []);

  const handleMouseDown = useCallback(e => {
    if (e.target === e.target.getStage()) {
      isPanning.current = true;
      lastDist.current = { x: e.evt.clientX, y: e.evt.clientY };
    }
  }, []);
  const handleMouseMove = useCallback(e => {
    if (!isPanning.current) return;
    const dx = (e.evt.clientX - lastDist.current.x) / scale;
    const dy = (e.evt.clientY - lastDist.current.y) / scale;
    lastDist.current = { x: e.evt.clientX, y: e.evt.clientY };
    setStagePos(pos => ({ x: pos.x + dx, y: pos.y + dy }));
  }, [scale]);
  const handleMouseUp = useCallback(() => { isPanning.current = false; }, []);
  const handleMouseLeave = handleMouseUp;

  return (
    <div className="absolute inset-0 bg-[#252525] z-20">
      <div className="absolute top-3 left-4 text-white text-lg z-40 cursor-pointer" onClick={handleSave}>
        Canvas Screen
      </div>
      <CanvasToolbar {...{handleSave}} />
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        x={stagePos.x}
        y={stagePos.y}
        scaleX={scale}
        scaleY={scale}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          if (e.target.getType() != "Stage") return;
          handleSelect(null);
        }}
      >
        <Layer>
          {canvasData?.images.map((img, i) => (
            <KonvaImage
              key={`img-${i}`}
              ref={el => (imageRefs.current[i] = el)}
              image={img.image()}
              x={img.x()}
              y={img.y()}
              rotation={img.rotation()}
              scaleX={img.scaleX()}
              scaleY={img.scaleY()}
              draggable
              onClick={() => handleSelect(i)}
              onDragMove={e => handleDragMove(e, i)}
              onDragEnd={e => handleDragEnd(e, img)}
              onTransformEnd={e => handleTransformEnd(e, img)}
            />
          ))}
          {canvasData?.objects.map((obj, j) => {
            const idx = canvasData.images.length + j;
            return (
              <Rect
                key={`obj-${j}`}
                ref={el => (objectRefs.current[j] = el)}
                x={obj.x()}
                y={obj.y()}
                width={obj.width()}
                height={obj.height()}
                rotation={obj.rotation()}
                scaleX={obj.scaleX()}
                scaleY={obj.scaleY()}
                fill={obj.fill()}
                stroke={obj.stroke()}
                strokeWidth={obj.strokeWidth()}
                draggable
                onClick={() => handleSelect(idx)}
                onDragMove={e => handleDragMove(e, idx)}
                onDragEnd={e => handleDragEnd(e, obj)}
                onTransformEnd={e => handleTransformEnd(e, obj)}
              />
            );
          })}
          <Transformer
            ref={transformerRef}
            rotateEnabled
            enabledAnchors={store.enabled_anchors}
            anchorSize={6}
            anchorStroke="white"
            anchorCornerRadius={10}
            borderEnabled={true}
            borderStroke='white'
            borderDash={[10, 5]}
            rotateAnchorOffset={40}
            rotationSnaps={
              store.rotation_increment > 1
                ? Array.from({ length: 360 / store.rotation_increment + 1 }, (_, i) => i * store.rotation_increment)
                : undefined
            }
          />
        </Layer>
      </Stage>
    </div>
  );
}
