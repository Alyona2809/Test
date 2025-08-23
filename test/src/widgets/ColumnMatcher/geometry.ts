export type Point = { x: number; y: number };

export function bezierPath(a: Point, b: Point): string {
  const midX = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`;
}

export function bezierPoint(a: Point, b: Point, t: number): Point {
  const midX = (a.x + b.x) / 2;
  const c1 = { x: midX, y: a.y };
  const c2 = { x: midX, y: b.y };
  const u = 1 - t;
  const x =
    u * u * u * a.x +
    3 * u * u * t * c1.x +
    3 * u * t * t * c2.x +
    t * t * t * b.x;
  const y =
    u * u * u * a.y +
    3 * u * u * t * c1.y +
    3 * u * t * t * c2.y +
    t * t * t * b.y;
  return { x, y };
}
