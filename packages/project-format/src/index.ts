/** Draft in-memory model; not yet a stable file format. */
export interface Project {
  schemaVersion: 1;
  id: string;
  name: string;
  frameRate: number;
  drawings: Record<string, Drawing>;
  layers: Layer[];
}
export interface Drawing {
  id: string;
  strokes: {
    id: string;
    points: { x: number; y: number; pressure: number }[];
  }[];
}
export interface Layer {
  id: string;
  name: string;
  exposures: { startFrame: number; duration: number; drawingId: string }[];
}
