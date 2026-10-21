import { z } from "zod";

/** BUILD 001 in-memory schema. No stable on-disk compatibility is promised yet. */
export const LIMITS = {
  layers: 32,
  strokes: 1000,
  points: 20000,
  strokePoints: 2048,
} as const;
export const idSchema = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/);
export const nameSchema = z.string().trim().min(1).max(80);
export const colorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .transform((s) => s.toLowerCase());
export const pointSchema = z
  .object({
    x: z.number().finite().min(0).max(4096),
    y: z.number().finite().min(0).max(4096),
    pressure: z.number().finite().min(0).max(1),
  })
  .strict();
export const strokeSchema = z
  .object({
    id: idSchema,
    color: colorSchema,
    size: z.number().finite().min(1).max(64),
    points: z.array(pointSchema).min(1).max(LIMITS.strokePoints),
  })
  .strict();
export const drawingSchema = z
  .object({ id: idSchema, strokes: z.array(strokeSchema).max(LIMITS.strokes) })
  .strict();
export const layerSchema = z
  .object({
    id: idSchema,
    name: nameSchema,
    visible: z.boolean(),
    drawingId: idSchema,
  })
  .strict();
export const projectSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: idSchema,
    name: nameSchema,
    frameRate: z.number().int().min(1).max(120),
    canvas: z
      .object({
        width: z.number().int().min(32).max(4096),
        height: z.number().int().min(32).max(4096),
      })
      .strict(),
    drawings: z.array(drawingSchema).min(1).max(LIMITS.layers),
    layers: z.array(layerSchema).min(1).max(LIMITS.layers),
  })
  .strict()
  .superRefine((project, ctx) => {
    const fail = (message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    const ids = new Set<string>();
    const unique = (id: string) => {
      if (ids.has(id)) fail("Duplicate project entity ID");
      ids.add(id);
    };
    unique(project.id);
    let points = 0,
      strokes = 0;
    for (const drawing of project.drawings) {
      unique(drawing.id);
      for (const stroke of drawing.strokes) {
        unique(stroke.id);
        strokes++;
        points += stroke.points.length;
        if (
          stroke.points.some(
            (p) => p.x > project.canvas.width || p.y > project.canvas.height,
          )
        )
          fail("Point outside canvas");
      }
    }
    const references = new Set<string>();
    for (const layer of project.layers) {
      unique(layer.id);
      if (
        references.has(layer.drawingId) ||
        !project.drawings.some((d) => d.id === layer.drawingId)
      )
        fail("Invalid drawing reference");
      references.add(layer.drawingId);
    }
    if (references.size !== project.drawings.length) fail("Orphan drawing");
    if (points > LIMITS.points || strokes > LIMITS.strokes)
      fail("Project resource limit exceeded");
  });
export type Point = z.infer<typeof pointSchema>;
export type Stroke = z.infer<typeof strokeSchema>;
export type Drawing = z.infer<typeof drawingSchema>;
export type Layer = z.infer<typeof layerSchema>;
export type Project = z.infer<typeof projectSchema>;
export const validateProject = (input: unknown): Project =>
  projectSchema.parse(input);
export function createProject(): Project {
  return validateProject({
    schemaVersion: 1,
    id: "project-1",
    name: "Untitled drawing",
    frameRate: 24,
    canvas: { width: 960, height: 540 },
    drawings: [{ id: "drawing-1", strokes: [] }],
    layers: [
      { id: "layer-1", name: "Layer 1", visible: true, drawingId: "drawing-1" },
    ],
  });
}
