import { z } from "zod";
import {
  createProject,
  validateProject,
  idSchema,
  nameSchema,
  strokeSchema,
  pointSchema,
  LIMITS,
  type Project,
} from "@kreynima/project-format";
import { hitsStroke } from "@kreynima/drawing-core";
export const STATUS_COMMAND = "application.status" as const;
export const commandSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("stroke.add"),
      layerId: idSchema,
      stroke: strokeSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal("stroke.erase"),
      layerId: idSchema,
      path: z.array(pointSchema).min(1).max(LIMITS.strokePoints),
      radius: z.number().finite().min(1).max(64),
    })
    .strict(),
  z
    .object({
      type: z.literal("layer.add"),
      id: idSchema,
      drawingId: idSchema,
      name: nameSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal("layer.rename"),
      layerId: idSchema,
      name: nameSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal("layer.visibility"),
      layerId: idSchema,
      visible: z.boolean(),
    })
    .strict(),
  z
    .object({
      type: z.literal("layer.move"),
      layerId: idSchema,
      index: z
        .number()
        .int()
        .min(0)
        .max(LIMITS.layers - 1),
    })
    .strict(),
  z.object({ type: z.literal("project.rename"), name: nameSchema }).strict(),
  z.object({ type: z.literal("history.undo") }).strict(),
  z.object({ type: z.literal("history.redo") }).strict(),
]);
export type Command = z.infer<typeof commandSchema>;
export const requestSchema = z
  .object({
    command: commandSchema,
    expectedRevision: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  })
  .strict();
export const COMMANDS = commandSchema.options.map((s) => s.shape.type.value);
export function executeCommand(input: unknown) {
  z.object({ type: z.literal(STATUS_COMMAND) })
    .strict()
    .parse(input);
  return {
    application: "KREYNIMA",
    build: "001",
    sessionScope: "capabilities-only",
    capabilities: [STATUS_COMMAND, "project.read", ...COMMANDS],
  } as const;
}
export class CommandError extends Error {
  constructor(
    public readonly code:
      | "VALIDATION"
      | "CONFLICT"
      | "NOT_FOUND"
      | "HIDDEN_LAYER"
      | "EMPTY_HISTORY",
    message: string,
  ) {
    super(message);
  }
}
const pointCount = (p: Project) =>
  p.drawings.reduce(
    (n, d) => n + d.strokes.reduce((m, s) => m + s.points.length, 0),
    0,
  );
/** Isolated in-memory session. No filesystem, network, eval, process or native access. */
export class CommandEngine {
  private project: Project;
  private revision = 0;
  private undo: Project[] = [];
  private redo: Project[] = [];
  constructor(input: unknown = createProject()) {
    this.project = validateProject(input);
  }
  read() {
    return {
      project: structuredClone(this.project),
      revision: this.revision,
      canUndo: this.undo.length > 0,
      canRedo: this.redo.length > 0,
    };
  }
  dispatch(input: unknown) {
    const parsed = requestSchema.safeParse(input);
    if (!parsed.success)
      throw new CommandError("VALIDATION", "Invalid command fields or limits");
    const { command, expectedRevision } = parsed.data;
    if (expectedRevision !== this.revision)
      throw new CommandError(
        "CONFLICT",
        "Project changed; read the latest revision and retry",
      );
    const next = structuredClone(this.project);
    if (command.type === "history.undo" || command.type === "history.redo") {
      const source = command.type === "history.undo" ? this.undo : this.redo;
      const target = command.type === "history.undo" ? this.redo : this.undo;
      const previous = source.pop();
      if (!previous)
        throw new CommandError("EMPTY_HISTORY", "No history available");
      target.push(this.project);
      this.project = previous;
      this.revision++;
      return this.read();
    }
    if (command.type === "project.rename") next.name = command.name;
    else if (command.type === "layer.add") {
      next.layers.push({
        id: command.id,
        drawingId: command.drawingId,
        name: command.name,
        visible: true,
      });
      next.drawings.push({ id: command.drawingId, strokes: [] });
    } else {
      const layer = next.layers.find((l) => l.id === command.layerId);
      if (!layer) throw new CommandError("NOT_FOUND", "Layer not found");
      const drawing = next.drawings.find((d) => d.id === layer.drawingId)!;
      switch (command.type) {
        case "layer.rename":
          layer.name = command.name;
          break;
        case "layer.visibility":
          layer.visible = command.visible;
          break;
        case "layer.move": {
          if (command.index >= next.layers.length)
            throw new CommandError("VALIDATION", "Layer index out of range");
          next.layers.splice(next.layers.indexOf(layer), 1);
          next.layers.splice(command.index, 0, layer);
          break;
        }
        case "stroke.add":
        case "stroke.erase": {
          if (!layer.visible)
            throw new CommandError(
              "HIDDEN_LAYER",
              "Show this layer before drawing or erasing",
            );
          if (command.type === "stroke.add")
            drawing.strokes.push(command.stroke);
          else {
            if (
              command.path.some(
                (p) => p.x > next.canvas.width || p.y > next.canvas.height,
              )
            )
              throw new CommandError("VALIDATION", "Eraser outside canvas");
            drawing.strokes = drawing.strokes.filter(
              (s) => !hitsStroke(s, command.path, command.radius),
            );
          }
          break;
        }
      }
    }
    const validated = projectSchemaResult(next);
    if (JSON.stringify(validated) === JSON.stringify(this.project))
      return this.read();
    this.undo.push(this.project);
    this.redo = [];
    // Bound history by snapshots AND aggregate geometry, not just action count.
    while (
      this.undo.length > 40 ||
      this.undo.reduce((n, p) => n + pointCount(p), 0) > 100000
    )
      this.undo.shift();
    this.project = validated;
    this.revision++;
    return this.read();
  }
}
function projectSchemaResult(input: unknown) {
  try {
    return validateProject(input);
  } catch {
    throw new CommandError(
      "VALIDATION",
      "Project invariants or resource limits violated",
    );
  }
}
export type Snapshot = ReturnType<CommandEngine["read"]>;
