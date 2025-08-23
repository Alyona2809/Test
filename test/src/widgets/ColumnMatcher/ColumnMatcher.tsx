import React from "react";
import {
  CenterCell,
  CenterRow,
  Column,
  Handle,
  Item,
  RemoveBadge,
  Root,
  Svg,
} from "./styles";
import { bezierPath, bezierPoint } from "./geometry";
import { useElementRect } from "./hooks";

export type MatcherPair = { leftIndex: number; rightIndex: number };

type ColumnMatcherProps = {
  leftItems: string[];
  rightItems: string[];
  pairs: MatcherPair[];
  onChangePairs: (pairs: MatcherPair[]) => void;
};

type ActiveDrag = {
  side: "left" | "right";
  index: number;
  startX: number;
  startY: number;
} | null;

// styles + helpers moved to separate files to keep file size small and structure clean

export const ColumnMatcher: React.FC<ColumnMatcherProps> = ({
  leftItems,
  rightItems,
  pairs,
  onChangePairs,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const leftRefs = React.useRef<(HTMLLIElement | null)[]>([]);
  const rightRefs = React.useRef<(HTMLLIElement | null)[]>([]);

  const [active, setActive] = React.useState<ActiveDrag>(null);
  const [cursor, setCursor] = React.useState<{ x: number; y: number } | null>(
    null
  );

  const rect = useElementRect(containerRef as React.RefObject<HTMLElement>);

  // Right column randomized order, stable until rightItems length changes
  const [rightOrder, setRightOrder] = React.useState<number[]>([]);
  React.useEffect(() => {
    const order: number[] = Array.from(
      { length: rightItems.length },
      (_, i) => i
    );
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = order[i]!;
      order[i] = order[j]!;
      order[j] = tmp;
    }
    setRightOrder(order);
  }, [rightItems.length]);

  const findPairByIndex = (side: "left" | "right", index: number): number => {
    return pairs.findIndex((p) =>
      side === "left" ? p.leftIndex === index : p.rightIndex === index
    );
  };

  const removeByIndex = (side: "left" | "right", index: number) => {
    const i = findPairByIndex(side, index);
    if (i !== -1) onChangePairs([...pairs.slice(0, i), ...pairs.slice(i + 1)]);
  };

  const startDrag = (
    side: "left" | "right",
    index: number,
    e: React.MouseEvent | React.DragEvent
  ) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const box = containerRef.current.getBoundingClientRect();
    const clientX =
      (e as React.MouseEvent).clientX ?? (e as React.DragEvent).clientX;
    const clientY =
      (e as React.MouseEvent).clientY ?? (e as React.DragEvent).clientY;
    setActive({
      side,
      index,
      startX: clientX - box.left,
      startY: clientY - box.top,
    });
    setCursor({ x: clientX - box.left, y: clientY - box.top });
  };

  const startPointer = (
    side: "left" | "right",
    index: number,
    e: React.PointerEvent
  ) => {
    e.preventDefault();
    if (!containerRef.current) return;
    try {
      containerRef.current.setPointerCapture(e.pointerId);
    } catch {}
    const box = containerRef.current.getBoundingClientRect();
    setActive({
      side,
      index,
      startX: e.clientX - box.left,
      startY: e.clientY - box.top,
    });
    setCursor({ x: e.clientX - box.left, y: e.clientY - box.top });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!active || !containerRef.current) return;
    const box = containerRef.current.getBoundingClientRect();
    setCursor({ x: e.clientX - box.left, y: e.clientY - box.top });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!active || !containerRef.current) return;
    const box = containerRef.current.getBoundingClientRect();
    setCursor({ x: e.clientX - box.left, y: e.clientY - box.top });
  };

  // No HTML5 drag for logic; rely on mouse/pointer events

  const onMouseUp = () => {
    if (!active) return;
    const fromSide = active.side;
    const toSide: "left" | "right" = fromSide === "left" ? "right" : "left";
    const targets = toSide === "left" ? leftRefs.current : rightRefs.current;
    const hitIndex = targets.findIndex((el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const cx = (r.left + r.right) / 2;
      const cy = (r.top + r.bottom) / 2;
      return (
        Math.abs((rect?.left ?? 0) + (cursor?.x ?? 0) - cx) <= r.width / 2 &&
        Math.abs((rect?.top ?? 0) + (cursor?.y ?? 0) - cy) <= r.height / 2
      );
    });
    if (hitIndex !== -1) {
      const leftIndex = fromSide === "left" ? active.index : hitIndex;
      const rightIndex = fromSide === "right" ? active.index : hitIndex;
      // Validation: allow only matching indices (left i <-> right i)
      if (leftIndex !== rightIndex) {
        setActive(null);
        setCursor(null);
        return;
      }
      // replace or add single mapping for each side without reordering items
      const updated = pairs.filter(
        (p) => p.leftIndex !== leftIndex && p.rightIndex !== rightIndex
      );
      updated.push({ leftIndex, rightIndex });
      onChangePairs(updated);
    }
    setActive(null);
    setCursor(null);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    onMouseUp();
    try {
      containerRef.current?.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const getAnchor = (
    side: "left" | "right",
    index: number
  ): { x: number; y: number } | null => {
    const el =
      side === "left" ? leftRefs.current[index] : rightRefs.current[index];
    if (!el || !rect) return null;
    const r = el.getBoundingClientRect();
    const x = side === "left" ? r.right - rect.left : r.left - rect.left;
    const y = r.top - rect.top + r.height / 2;
    return { x, y };
  };

  const lines = pairs.map((p, idx) => {
    const a = getAnchor("left", p.leftIndex);
    const b = getAnchor("right", p.rightIndex);
    if (!a || !b) return null;
    return (
      <g key={`line-${idx}`}>
        <path
          d={bezierPath(a, b)}
          stroke="#18a34a"
          strokeWidth={3}
          fill="none"
        />
        <circle cx={a.x} cy={a.y} r={5} fill="#18a34a" />
        <circle cx={b.x} cy={b.y} r={5} fill="#18a34a" />
        {(() => {
          const p = bezierPoint(a, b, 0.2);
          return (
            <foreignObject x={p.x - 12} y={p.y - 12} width="24" height="24">
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "24px",
                  height: "24px",
                  pointerEvents: "all",
                }}
              >
                <RemoveBadge
                  style={{ position: "static", transform: "none" }}
                  onClick={() =>
                    onChangePairs(pairs.filter((pair, i) => i !== idx))
                  }
                >
                  ×
                </RemoveBadge>
              </div>
            </foreignObject>
          );
        })()}
      </g>
    );
  });

  let tempLine: React.ReactNode = null;
  if (active && cursor) {
    const from = getAnchor(active.side, active.index);
    if (from) {
      const to = { x: cursor.x, y: cursor.y };
      tempLine = (
        <g>
          <path
            d={bezierPath(from, to)}
            stroke="#18a34a"
            strokeDasharray="6 6"
            strokeWidth={2.5}
            fill="none"
          />
          <circle cx={from.x} cy={from.y} r={5} fill="#18a34a" />
          <circle cx={to.x} cy={to.y} r={5} fill="#18a34a" />
        </g>
      );
    }
  }

  return (
    <Root
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <Column>
        {leftItems.map((text, idx) => {
          const pairedWith = pairs.find((p) => p.leftIndex === idx)?.rightIndex;
          return (
            <Item
              key={idx}
              ref={(el) => (leftRefs.current[idx] = el)}
              $active={typeof pairedWith === "number"}
              onMouseDown={(e) => startDrag("left", idx, e)}
              onPointerDown={(e) => startPointer("left", idx, e)}
            >
              {text}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Handle
                  aria-label="Соединить"
                  onMouseDown={(e) => startDrag("left", idx, e)}
                  onPointerDown={(e) => startPointer("left", idx, e)}
                />
              </div>
            </Item>
          );
        })}
      </Column>
      <Column>
        {rightOrder.map((originalIdx, visualIdx) => {
          const text = rightItems[originalIdx];
          const pairedWith = pairs.find(
            (p) => p.rightIndex === originalIdx
          )?.leftIndex;
          return (
            <Item
              key={originalIdx}
              ref={(el) => (rightRefs.current[originalIdx] = el)}
              $active={typeof pairedWith === "number"}
              onMouseDown={(e) => startDrag("right", originalIdx, e)}
              onPointerDown={(e) => startPointer("right", originalIdx, e)}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Handle
                  aria-label="Соединить"
                  onMouseDown={(e) => startDrag("right", originalIdx, e)}
                  onPointerDown={(e) => startPointer("right", originalIdx, e)}
                />
              </div>
              {text}
            </Item>
          );
        })}
      </Column>
      {rect && (
        <Svg width={rect.width} height={rect.height}>
          {lines}
          {tempLine}
        </Svg>
      )}
      <CenterRow>
        <CenterCell />
        <CenterCell />
      </CenterRow>
    </Root>
  );
};

export default ColumnMatcher;
