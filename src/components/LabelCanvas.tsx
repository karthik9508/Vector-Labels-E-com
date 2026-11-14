"use client";

import { useRef, useState } from "react";
import {
  DEFAULT_TRANSFORMS,
  buildLabelSvg,
  clampLayerOffset,
  computeLayout,
  type DesignTransforms,
  type LabelBox,
  type LabelDesign,
  type LayerOffset,
} from "@/lib/label-design";

export type CanvasLayer = "text" | "sub" | "artwork";

/** SVG layout units are PX_PER_MM per millimetre. */
const PX_PER_MM = 8;
const SNAP_PX = 9;
const MIN_SCALE = 0.3;
const MAX_SCALE = 2.5;
const NUDGE_MM = 0.5;
const NUDGE_FAST_MM = 2;

interface DragSession {
  layer: CanvasLayer;
  mode: "move" | "scale" | "rotate";
  pointerId: number;
  startClientX: number;
  startClientY: number;
  /** CSS pixels per millimetre, measured when the drag started. */
  pxPerMm: number;
  origin: DesignTransforms;
  originOffset: LayerOffset;
  originScale: number;
  originRotate: number;
  centreClientX: number;
  centreClientY: number;
  startDistance: number;
  startAngle: number;
}

interface LabelCanvasProps {
  design: LabelDesign;
  widthMm: number;
  heightMm: number;
  selected: CanvasLayer | null;
  onSelect: (layer: CanvasLayer | null) => void;
  onChange: (next: LabelDesign) => void;
  /** Called once before a gesture starts so the page can record undo history. */
  onGestureStart: () => void;
}

function boxOf(
  layout: ReturnType<typeof computeLayout>,
  layer: CanvasLayer
): LabelBox | null {
  if (layer === "artwork") return layout.artwork?.box ?? null;
  if (layer === "text") return layout.text?.box ?? null;
  return layout.sub?.box ?? null;
}

function percent(value: number, total: number): string {
  return `${(value / total) * 100}%`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default function LabelCanvas({
  design,
  widthMm,
  heightMm,
  selected,
  onSelect,
  onChange,
  onGestureStart,
}: LabelCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<DragSession | null>(null);
  const [guides, setGuides] = useState({ x: false, y: false });

  const layout = computeLayout(design, { widthMm, heightMm });
  // The same layout with no manual offsets — the reference geometry that
  // clamping, snapping and "reset" all measure from.
  const baseLayout = computeLayout(
    { ...design, transforms: DEFAULT_TRANSFORMS },
    { widthMm, heightMm }
  );

  const svg = buildLabelSvg(design, { widthMm, heightMm, fluid: true });

  /** Keep an element inside the border, or at least its centre on the label. */
  function clampOffset(layer: CanvasLayer, offset: LayerOffset): LayerOffset {
    const base = boxOf(baseLayout, layer);
    if (!base) return offset;
    return clampLayerOffset(offset, base, layout.inset, layout.width, layout.height);
  }

  function withLayerTransform(
    origin: DesignTransforms,
    layer: CanvasLayer,
    patch: Partial<{ offset: LayerOffset; scale: number; rotate: number }>
  ): DesignTransforms {
    if (layer === "artwork") {
      return {
        ...origin,
        artwork: {
          offset: patch.offset ?? origin.artwork.offset,
          scale: patch.scale ?? origin.artwork.scale,
          rotate: patch.rotate ?? origin.artwork.rotate,
        },
      };
    }
    return {
      ...origin,
      [layer]: patch.offset ?? origin[layer],
    } as DesignTransforms;
  }

  function beginDrag(
    event: React.PointerEvent<HTMLElement>,
    layer: CanvasLayer,
    mode: DragSession["mode"]
  ) {
    event.stopPropagation();
    const stage = stageRef.current;
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    if (!rect.width) return;

    onSelect(layer);
    onGestureStart();

    const current = design.transforms ?? DEFAULT_TRANSFORMS;
    const offset =
      layer === "artwork" ? current.artwork.offset : (current[layer] as LayerOffset);
    const layerBox = boxOf(layout, layer);

    const centreLocalX = layerBox ? layerBox.x + layerBox.width / 2 : layout.width / 2;
    const centreLocalY = layerBox ? layerBox.y + layerBox.height / 2 : layout.height / 2;
    const centreClientX = rect.left + (centreLocalX / layout.width) * rect.width;
    const centreClientY = rect.top + (centreLocalY / layout.height) * rect.height;

    sessionRef.current = {
      layer,
      mode,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      pxPerMm: rect.width / widthMm,
      origin: current,
      originOffset: offset,
      originScale: current.artwork.scale,
      originRotate: current.artwork.rotate,
      centreClientX,
      centreClientY,
      startDistance: Math.hypot(event.clientX - centreClientX, event.clientY - centreClientY) || 1,
      startAngle:
        (Math.atan2(event.clientY - centreClientY, event.clientX - centreClientX) * 180) / Math.PI,
    };

    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    const session = sessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    event.preventDefault();

    if (session.mode === "move") {
      const deltaX = (event.clientX - session.startClientX) / session.pxPerMm;
      const deltaY = (event.clientY - session.startClientY) / session.pxPerMm;

      let offset: LayerOffset = {
        x: session.originOffset.x + deltaX,
        y: session.originOffset.y + deltaY,
      };
      offset = clampOffset(session.layer, offset);

      // Snap the element's centre to the label's centre lines.
      const base = boxOf(baseLayout, session.layer);
      let snappedX = false;
      let snappedY = false;

      if (base) {
        const centreX = base.x + offset.x * PX_PER_MM + base.width / 2;
        const centreY = base.y + offset.y * PX_PER_MM + base.height / 2;

        if (Math.abs(centreX - layout.width / 2) < SNAP_PX) {
          offset = {
            ...offset,
            x: (layout.width / 2 - base.width / 2 - base.x) / PX_PER_MM,
          };
          snappedX = true;
        }
        if (Math.abs(centreY - layout.height / 2) < SNAP_PX) {
          offset = {
            ...offset,
            y: (layout.height / 2 - base.height / 2 - base.y) / PX_PER_MM,
          };
          snappedY = true;
        }
      }

      setGuides({ x: snappedX, y: snappedY });
      onChange({
        ...design,
        transforms: withLayerTransform(session.origin, session.layer, {
          offset: { x: round2(offset.x), y: round2(offset.y) },
        }),
      });
      return;
    }

    if (session.mode === "scale") {
      const distance = Math.hypot(
        event.clientX - session.centreClientX,
        event.clientY - session.centreClientY
      );
      const scale = clamp(
        (session.originScale * distance) / session.startDistance,
        MIN_SCALE,
        MAX_SCALE
      );
      onChange({
        ...design,
        transforms: withLayerTransform(session.origin, "artwork", { scale: round2(scale) }),
      });
      return;
    }

    // rotate
    const angle =
      (Math.atan2(event.clientY - session.centreClientY, event.clientX - session.centreClientX) *
        180) /
      Math.PI;
    let rotation = session.originRotate + (angle - session.startAngle);
    rotation = ((rotation % 360) + 360) % 360;
    // Ease into the nearest 15° step when close, for straight labels.
    const nearestStep = Math.round(rotation / 15) * 15;
    if (Math.abs(rotation - nearestStep) <= 4 || event.shiftKey) rotation = nearestStep;
    onChange({
      ...design,
      transforms: withLayerTransform(session.origin, "artwork", {
        rotate: Math.round(rotation),
      }),
    });
  }

  function endDrag(event: React.PointerEvent<HTMLElement>) {
    const session = sessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    sessionRef.current = null;
    setGuides({ x: false, y: false });
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function resetLayer(layer: CanvasLayer) {
    onGestureStart();
    const current = design.transforms ?? DEFAULT_TRANSFORMS;
    onChange({
      ...design,
      transforms:
        layer === "artwork"
          ? { ...current, artwork: { offset: { x: 0, y: 0 }, scale: 1, rotate: 0 } }
          : { ...current, [layer]: { x: 0, y: 0 } },
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!selected) return;
    if (event.key === "Escape") {
      onSelect(null);
      return;
    }
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      resetLayer(selected);
      return;
    }

    const step = event.shiftKey ? NUDGE_FAST_MM : NUDGE_MM;
    const delta: LayerOffset =
      event.key === "ArrowLeft"
        ? { x: -step, y: 0 }
        : event.key === "ArrowRight"
          ? { x: step, y: 0 }
          : event.key === "ArrowUp"
            ? { x: 0, y: -step }
            : event.key === "ArrowDown"
              ? { x: 0, y: step }
              : { x: 0, y: 0 };

    if (!delta.x && !delta.y) return;
    event.preventDefault();
    onGestureStart();

    const current = design.transforms ?? DEFAULT_TRANSFORMS;
    const originOffset =
      selected === "artwork" ? current.artwork.offset : (current[selected] as LayerOffset);
    const offset = clampOffset(selected, {
      x: originOffset.x + delta.x,
      y: originOffset.y + delta.y,
    });
    onChange({
      ...design,
      transforms: withLayerTransform(current, selected, {
        offset: { x: round2(offset.x), y: round2(offset.y) },
      }),
    });
  }

  const textBox = layout.text?.box ?? null;
  const subBox = layout.sub?.box ?? null;
  const artworkBox = layout.artwork?.box ?? null;

  const layerStyle = (box: LabelBox, rotation = 0): React.CSSProperties => ({
    left: percent(box.x, layout.width),
    top: percent(box.y, layout.height),
    width: percent(box.width, layout.width),
    height: percent(box.height, layout.height),
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
  });

  // `touch-none` on the hit areas (not the whole stage) stops the page from
  // scrolling while dragging an element, without freezing the canvas itself.
  const selectRing = (active: boolean) =>
    `touch-none ${
      active
        ? "outline outline-2 outline-offset-2 outline-luxury-gold bg-luxury-gold/10"
        : "outline-dashed outline-1 outline-transparent hover:outline hover:outline-luxury-gold/60"
    }`;

  return (
    <div
      ref={stageRef}
      role="application"
      aria-label="Label design canvas — drag elements to position them, arrow keys to nudge"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={() => onSelect(null)}
      className="relative h-full w-full select-none overflow-hidden rounded-sm border border-black/10 bg-black/5 shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-luxury-gold"
    >
      <div
        className="pointer-events-none absolute inset-0"
        // Generated by buildLabelSvg, which escapes every user string.
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      {/* Element hit areas. Selection is mirrored in the toolbar, which is the
          keyboard-accessible way to pick a layer and adjust it precisely. */}
      {textBox ? (
        <div
          aria-hidden="true"
          onPointerDown={(event) => beginDrag(event, "text", "move")}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={() => resetLayer("text")}
          className={`absolute cursor-move rounded-sm transition-colors ${selectRing(selected === "text")}`}
          style={layerStyle(textBox)}
        />
      ) : null}

      {subBox ? (
        <div
          aria-hidden="true"
          onPointerDown={(event) => beginDrag(event, "sub", "move")}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={() => resetLayer("sub")}
          className={`absolute cursor-move rounded-sm transition-colors ${selectRing(selected === "sub")}`}
          style={layerStyle(subBox)}
        />
      ) : null}

      {artworkBox ? (
        <div
          aria-hidden="true"
          onPointerDown={(event) => beginDrag(event, "artwork", "move")}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={() => resetLayer("artwork")}
          className={`absolute cursor-move rounded-sm transition-colors ${selectRing(selected === "artwork")}`}
          style={layerStyle(artworkBox, layout.artwork?.rotation ?? 0)}
        >
          {selected === "artwork" ? (
            <>
              {/* Scale */}
              <span
                onPointerDown={(event) => beginDrag(event, "artwork", "scale")}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border border-luxury-charcoal bg-luxury-gold"
              />
              {/* Rotate */}
              <span
                onPointerDown={(event) => beginDrag(event, "artwork", "rotate")}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className="absolute -top-6 left-1/2 h-3.5 w-3.5 -translate-x-1/2 cursor-grab rounded-full border border-luxury-charcoal bg-white"
              />
            </>
          ) : null}
        </div>
      ) : null}

      {/* Snap guides */}
      {guides.x ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-luxury-gold/80"
        />
      ) : null}
      {guides.y ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-luxury-gold/80"
        />
      ) : null}
    </div>
  );
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
