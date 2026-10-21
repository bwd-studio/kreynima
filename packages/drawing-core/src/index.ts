import type { Point, Stroke } from "@kreynima/project-format";

function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const t =
    dx === 0 && dy === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            1,
            ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy),
          ),
        );
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}
function cross(a: Point, b: Point, c: Point) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
function segmentDistance(a: Point, b: Point, c: Point, d: Point): number {
  // Include crossings even when all four endpoints are far from the other line.
  if (
    cross(a, b, c) * cross(a, b, d) < 0 &&
    cross(c, d, a) * cross(c, d, b) < 0
  )
    return 0;
  return Math.min(
    distanceToSegment(a, c, d),
    distanceToSegment(b, c, d),
    distanceToSegment(c, a, b),
    distanceToSegment(d, a, b),
  );
}
/** Whole-stroke eraser; all swept segments are considered, including single dots. */
export function hitsStroke(
  stroke: Stroke,
  path: Point[],
  radius: number,
): boolean {
  for (let i = 0; i < stroke.points.length; i++) {
    const a = stroke.points[i],
      b = stroke.points[Math.max(0, i - 1)];
    for (let j = 0; j < path.length; j++) {
      if (
        segmentDistance(a, b, path[j], path[Math.max(0, j - 1)]) <=
        radius + stroke.size / 2
      )
        return true;
    }
  }
  return false;
}
/** Shared SVG geometry. A one-point stroke is rendered as a circle by the adapter. */
export const strokePath = (points: Point[]) =>
  points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
