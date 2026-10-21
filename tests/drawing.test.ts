import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CommandEngine,
  CommandError,
  type Command,
} from "@kreynima/command-engine";
import {
  createProject,
  validateProject,
  type Point,
} from "@kreynima/project-format";
import { hitsStroke } from "@kreynima/drawing-core";
import { createProjectTools } from "@kreynima/agent-tools";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const point = (x = 10, y = 10): Point => ({ x, y, pressure: 0.5 });
const stroke = (id = "stroke-1") => ({
  id,
  color: "#AA3344",
  size: 6,
  points: [point(), point(80, 60)],
});
const add = (id = "stroke-1", layerId = "layer-1"): Command => ({
  type: "stroke.add",
  layerId,
  stroke: stroke(id),
});
const apply = (e: CommandEngine, command: Command) =>
  e.dispatch({ command, expectedRevision: e.read().revision });
const count = (e: CommandEngine) =>
  e.read().project.drawings.reduce((n, d) => n + d.strokes.length, 0);

test("project round-trip validates references, IDs, version, color, geometry and resource bounds", () => {
  const p = createProject();
  assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))), p);
  for (const change of [
    (p: Record<string, unknown>) => {
      p.schemaVersion = 2;
    },
    (p: Record<string, unknown>) => {
      p.code = "exec()";
    },
    (p: Record<string, unknown>) => {
      p.layers = [];
    },
    (p: Record<string, unknown>) => {
      p.frameRate = 0;
    },
  ]) {
    const bad = structuredClone(p);
    change(bad);
    assert.throws(() => validateProject(bad));
  }
  const dangling = createProject();
  dangling.layers[0].drawingId = "missing";
  assert.throws(() => validateProject(dangling));
  const duplicate = createProject();
  duplicate.layers[0].id = duplicate.id;
  assert.throws(() => validateProject(duplicate));
  const shared = createProject();
  shared.layers.push({ ...shared.layers[0], id: "layer-2" });
  assert.throws(() => validateProject(shared));
  for (const bad of [
    { ...stroke(), color: "url(javascript:alert(1))" },
    { ...stroke(), size: Infinity },
    { ...stroke(), points: [point(NaN)] },
    { ...stroke(), points: [{ ...point(), pressure: 2 }] },
    { ...stroke(), points: [point(1000)] },
    { ...stroke(), points: Array.from({ length: 2049 }, () => point()) },
  ]) {
    const badProject = createProject();
    badProject.drawings[0].strokes.push(bad);
    assert.throws(() => validateProject(badProject));
  }
});
test("strokes retain vector points, colors, width; boundaries detach snapshots and inputs", () => {
  const engine = new CommandEngine();
  const cmd = add();
  const result = apply(engine, cmd);
  assert.equal(result.project.drawings[0].strokes[0].color, "#aa3344");
  assert.deepEqual(
    result.project.drawings[0].strokes[0].points,
    stroke().points,
  );
  result.project.drawings[0].strokes = [];
  if (cmd.type === "stroke.add") cmd.stroke.points[0].x = 900;
  assert.equal(count(engine), 1);
  assert.equal(engine.read().project.drawings[0].strokes[0].points[0].x, 10);
});
test("strict commands, revision conflict, duplicate IDs and missing references fail atomically", () => {
  const engine = new CommandEngine();
  apply(engine, add());
  const before = engine.read();
  for (const command of [
    { type: "shell", code: "whoami" },
    { ...add("stroke-2"), extra: true },
    add(),
    add("stroke-3", "missing"),
    {
      type: "stroke.add",
      layerId: "layer-1",
      stroke: { ...stroke("stroke-4"), points: [point(961)] },
    },
  ]) {
    assert.throws(() =>
      engine.dispatch({ command, expectedRevision: before.revision }),
    );
    assert.deepEqual(engine.read(), before);
  }
  assert.throws(
    () => engine.dispatch({ command: add("stroke-5"), expectedRevision: 0 }),
    (e: unknown) => e instanceof CommandError && e.code === "CONFLICT",
  );
  assert.throws(() =>
    engine.dispatch({
      command: add("stroke-5"),
      expectedRevision: before.revision,
      exec: true,
    }),
  );
  assert.deepEqual(engine.read(), before);
});
test("layers add, rename, hide and reorder without moving geometry between drawings", () => {
  const e = new CommandEngine();
  apply(e, add());
  apply(e, {
    type: "layer.add",
    id: "layer-2",
    drawingId: "drawing-2",
    name: "Foreground",
  });
  apply(e, add("stroke-2", "layer-2"));
  apply(e, { type: "layer.rename", layerId: "layer-2", name: "  Ink  " });
  apply(e, { type: "layer.move", layerId: "layer-2", index: 0 });
  let p = e.read().project;
  assert.deepEqual(
    p.layers.map((l) => l.id),
    ["layer-2", "layer-1"],
  );
  assert.equal(p.layers[0].name, "Ink");
  apply(e, { type: "layer.visibility", layerId: "layer-2", visible: false });
  assert.throws(() => apply(e, add("stroke-3", "layer-2")), /Show this layer/);
  assert.throws(
    () =>
      apply(e, {
        type: "stroke.erase",
        layerId: "layer-2",
        path: [point()],
        radius: 10,
      }),
    /Show this layer/,
  );
  assert.equal(count(e), 2);
  apply(e, { type: "history.undo" });
  p = e.read().project;
  assert.equal(p.layers[0].visible, true);
  assert.equal(p.drawings[1].strokes[0].id, "stroke-2");
});
test("whole-stroke eraser uses swept segments, brush width, dots and selected layer only", () => {
  const line = {
    id: "line",
    size: 4,
    color: "#000000",
    points: [point(0, 50), point(100, 50)],
  };
  assert.equal(hitsStroke(line, [point(50, 0), point(50, 100)], 1), true);
  assert.equal(hitsStroke(line, [point(50, 53)], 1), true);
  assert.equal(hitsStroke(line, [point(50, 54)], 1), false);
  assert.equal(
    hitsStroke(
      { ...line, points: [point(50, 50)] },
      [point(50, 0), point(50, 100)],
      1,
    ),
    true,
  );
  const e = new CommandEngine();
  apply(e, add());
  apply(e, {
    type: "layer.add",
    id: "layer-2",
    drawingId: "drawing-2",
    name: "Top",
  });
  apply(e, add("stroke-2", "layer-2"));
  const before = e.read().project;
  apply(e, {
    type: "stroke.erase",
    layerId: "layer-1",
    path: [point()],
    radius: 2,
  });
  assert.equal(count(e), 1);
  assert.equal(e.read().project.drawings[1].strokes.length, 1);
  apply(e, { type: "history.undo" });
  assert.deepEqual(e.read().project, before);
});
test("undo/redo restores complete edits; revisions are monotonic and new edits clear redo", () => {
  const e = new CommandEngine();
  const first = e.read().project;
  apply(e, add());
  const drawn = e.read().project;
  apply(e, { type: "history.undo" });
  assert.deepEqual(e.read().project, first);
  assert.equal(e.read().revision, 2);
  apply(e, { type: "history.redo" });
  assert.deepEqual(e.read().project, drawn);
  assert.equal(e.read().revision, 3);
  apply(e, { type: "history.undo" });
  apply(e, { type: "project.rename", name: "New drawing" });
  assert.equal(e.read().canRedo, false);
  const before = e.read();
  assert.throws(() => apply(e, { type: "history.redo" }));
  assert.deepEqual(e.read(), before);
});
test("no-op edits preserve revision, history and redo", () => {
  const e = new CommandEngine();
  apply(e, add());
  apply(e, { type: "history.undo" });
  const before = e.read();
  apply(e, { type: "layer.visibility", layerId: "layer-1", visible: true });
  apply(e, {
    type: "stroke.erase",
    layerId: "layer-1",
    path: [point()],
    radius: 1,
  });
  assert.deepEqual(e.read(), before);
});
test("project and history limits remain bounded and rejected edits leave state intact", () => {
  const e = new CommandEngine();
  for (let i = 0; i < 60; i++)
    apply(e, { type: "project.rename", name: `Drawing ${i}` });
  let undos = 0;
  while (e.read().canUndo) {
    apply(e, { type: "history.undo" });
    undos++;
  }
  assert.equal(undos, 40);
  const layers = new CommandEngine();
  for (let i = 2; i <= 32; i++)
    apply(layers, {
      type: "layer.add",
      id: `layer-${i}`,
      drawingId: `drawing-${i}`,
      name: `Layer ${i}`,
    });
  const before = layers.read();
  assert.throws(() =>
    apply(layers, {
      type: "layer.add",
      id: "layer-33",
      drawingId: "drawing-33",
      name: "Too many",
    }),
  );
  assert.deepEqual(layers.read(), before);
  const dense = new CommandEngine();
  for (let i = 0; i < 10; i++)
    apply(dense, {
      type: "stroke.add",
      layerId: "layer-1",
      stroke: {
        ...stroke(`dense-${i}`),
        points: Array.from({ length: 2000 }, () => point()),
      },
    });
  const full = dense.read();
  assert.throws(() => apply(dense, add()));
  assert.deepEqual(dense.read(), full);
  for (let i = 0; i < 20; i++)
    apply(dense, { type: "project.rename", name: `Dense ${i}` });
  let denseUndos = 0;
  while (dense.read().canUndo) {
    apply(dense, { type: "history.undo" });
    denseUndos++;
  }
  assert.equal(
    denseUndos,
    5,
    "100,000-point history budget prunes dense snapshots",
  );
});
test("tool sessions are isolated and use the same operation results as desktop engine", () => {
  const a = createProjectTools(),
    b = createProjectTools(),
    e = new CommandEngine();
  for (const cmd of [
    add(),
    { type: "history.undo" },
    { type: "history.redo" },
  ] as Command[]) {
    const request = { command: cmd, expectedRevision: e.read().revision };
    assert.deepEqual(a.command(request), e.dispatch(request));
  }
  assert.equal(b.read().revision, 0);
  assert.equal(b.read().project.drawings[0].strokes.length, 0);
});
test(
  "actual stdio MCP drawing operations match engine, reject invalid requests and retain state",
  { timeout: 15000 },
  async () => {
    const client = new Client({ name: "drawing-test", version: "0.0.0" });
    const e = new CommandEngine();
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ["apps/mcp-server/dist/index.js"],
    });
    function value(result: Awaited<ReturnType<Client["callTool"]>>) {
      assert.equal(result.isError, undefined);
      const item = (result.content as { type: string; text: string }[])[0];
      assert.equal(item.type, "text");
      return JSON.parse(item.text);
    }
    try {
      await client.connect(transport);
      assert.deepEqual(
        value(
          await client.callTool({ name: "kreynima_project", arguments: {} }),
        ),
        e.read(),
      );
      const commands: Command[] = [
        add(),
        {
          type: "layer.add",
          id: "layer-2",
          drawingId: "drawing-2",
          name: "Top",
        },
        add("stroke-2", "layer-2"),
        { type: "layer.rename", layerId: "layer-2", name: "Ink" },
        { type: "layer.visibility", layerId: "layer-2", visible: false },
        { type: "layer.move", layerId: "layer-2", index: 0 },
        { type: "project.rename", name: "Test" },
        {
          type: "stroke.erase",
          layerId: "layer-1",
          path: [point()],
          radius: 4,
        },
        { type: "history.undo" },
        { type: "history.redo" },
      ];
      for (const command of commands) {
        const request = { command, expectedRevision: e.read().revision };
        assert.deepEqual(
          value(
            await client.callTool({
              name: "kreynima_command",
              arguments: request,
            }),
          ),
          e.dispatch(request),
        );
      }
      for (const request of [
        {
          command: { type: "shell", code: "whoami" },
          expectedRevision: e.read().revision,
        },
        { command: add("other"), expectedRevision: 0 },
        {
          command: add("other"),
          expectedRevision: e.read().revision,
          exec: true,
        },
      ])
        assert.equal(
          (
            await client.callTool({
              name: "kreynima_command",
              arguments: request,
            })
          ).isError,
          true,
        );
      assert.deepEqual(
        value(
          await client.callTool({ name: "kreynima_project", arguments: {} }),
        ),
        e.read(),
      );
    } finally {
      await client.close();
    }
  },
);
