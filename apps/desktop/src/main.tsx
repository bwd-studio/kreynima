import { createRoot } from "react-dom/client";
import { useRef, useState, type PointerEvent } from "react";
import {
  CommandEngine,
  type Command,
  type Snapshot,
} from "@kreynima/command-engine";
import { LIMITS, type Point, type Stroke } from "@kreynima/project-format";
import { strokePath } from "@kreynima/drawing-core";
import "./style.css";

function StrokeView({ stroke }: { stroke: Stroke }) {
  if (stroke.points.length === 1)
    return (
      <circle
        data-stroke-id={stroke.id}
        cx={stroke.points[0].x}
        cy={stroke.points[0].y}
        r={stroke.size / 2}
        fill={stroke.color}
      />
    );
  return (
    <path
      data-stroke-id={stroke.id}
      d={strokePath(stroke.points)}
      fill="none"
      stroke={stroke.color}
      strokeWidth={stroke.size}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
type Gesture = {
  pointerId: number;
  layerId: string;
  revision: number;
  tool: "brush" | "eraser";
  color: string;
  size: number;
  points: Point[];
};
function App() {
  const [engine] = useState(() => new CommandEngine());
  const [snapshot, setSnapshot] = useState<Snapshot>(() => engine.read());
  const [activeLayer, setActiveLayer] = useState("layer-1");
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [color, setColor] = useState("#252a35");
  const [size, setSize] = useState(6);
  const [preview, setPreview] = useState<Gesture | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const [error, setError] = useState("");
  const { project, revision, canUndo, canRedo } = snapshot;
  const active =
    project.layers.find((l) => l.id === activeLayer) ??
    project.layers[project.layers.length - 1];
  function dispatch(command: Command, expectedRevision = revision) {
    try {
      const next = engine.dispatch({ command, expectedRevision });
      setSnapshot(next);
      setError("");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Command failed");
      return false;
    }
  }
  function point(e: PointerEvent<SVGSVGElement>): Point {
    const bounds = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(
        0,
        Math.min(
          project.canvas.width,
          ((e.clientX - bounds.left) / bounds.width) * project.canvas.width,
        ),
      ),
      y: Math.max(
        0,
        Math.min(
          project.canvas.height,
          ((e.clientY - bounds.top) / bounds.height) * project.canvas.height,
        ),
      ),
      pressure: e.pointerType === "pen" ? e.pressure : 0.5,
    };
  }
  function begin(e: PointerEvent<SVGSVGElement>) {
    if (e.button !== 0 || gesture.current) return;
    if (!active.visible) {
      setError("Show the selected layer before drawing or erasing.");
      return;
    }
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = {
      pointerId: e.pointerId,
      layerId: active.id,
      revision,
      tool,
      color,
      size,
      points: [point(e)],
    };
    setPreview({ ...gesture.current });
    setError("");
  }
  function move(e: PointerEvent<SVGSVGElement>) {
    const current = gesture.current;
    if (!current || current.pointerId !== e.pointerId) return;
    const p = point(e),
      last = current.points[current.points.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) < 0.5) return;
    if (current.points.length >= LIMITS.strokePoints) {
      cancel();
      setError("Stroke exceeds 2048 points. Draw shorter strokes.");
      return;
    }
    current.points.push(p);
    setPreview({ ...current, points: [...current.points] });
  }
  function cancel() {
    gesture.current = null;
    setPreview(null);
  }
  function finish(e: PointerEvent<SVGSVGElement>) {
    if (!gesture.current || gesture.current.pointerId !== e.pointerId) return;
    move(e);
    const current = gesture.current;
    cancel();
    if (current) {
      if (current.tool === "brush")
        dispatch(
          {
            type: "stroke.add",
            layerId: current.layerId,
            stroke: {
              id: `stroke-${crypto.randomUUID()}`,
              color: current.color,
              size: current.size,
              points: current.points,
            },
          },
          current.revision,
        );
      else
        dispatch(
          {
            type: "stroke.erase",
            layerId: current.layerId,
            path: current.points,
            radius: current.size / 2,
          },
          current.revision,
        );
    }
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  }
  function addLayer() {
    const id = crypto.randomUUID();
    if (
      dispatch({
        type: "layer.add",
        id: `layer-${id}`,
        drawingId: `drawing-${id}`,
        name: `Layer ${project.layers.length + 1}`,
      })
    )
      setActiveLayer(`layer-${id}`);
  }
  return (
    <main>
      <header>
        <div>
          <p className="eyebrow">BuildWithDani · BUILD 001</p>
          <h1>
            KREYNIMA <span>Drawing studio</span>
          </h1>
        </div>
        <p className="session-note">
          In-memory session · Not saved
          <br />
          MCP runs a separate project
        </p>
      </header>
      <div className="toolbar" role="toolbar" aria-label="Drawing tools">
        <button
          aria-pressed={tool === "brush"}
          onClick={() => setTool("brush")}
        >
          Brush
        </button>
        <button
          aria-pressed={tool === "eraser"}
          onClick={() => setTool("eraser")}
        >
          Eraser
        </button>
        <label className="color-label">
          Color{" "}
          <input
            type="color"
            aria-label="Brush color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
        <label>
          Size{" "}
          <input
            type="range"
            aria-label="Brush size"
            min="2"
            max="64"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
          <output>{size} px</output>
        </label>
        <div className="history">
          <button
            disabled={!canUndo || !!preview}
            onClick={() => dispatch({ type: "history.undo" })}
          >
            Undo
          </button>
          <button
            disabled={!canRedo || !!preview}
            onClick={() => dispatch({ type: "history.redo" })}
          >
            Redo
          </button>
        </div>
      </div>
      <div className="workspace">
        <section className="canvas-panel" aria-label="Drawing workspace">
          <div className="canvas-meta">
            <span>{project.name}</span>
            <span>
              {project.canvas.width} × {project.canvas.height}
            </span>
          </div>
          <div className="canvas-surround">
            <svg
              className={`drawing-canvas ${tool}`}
              viewBox={`0 0 ${project.canvas.width} ${project.canvas.height}`}
              aria-label="Drawing canvas"
              role="img"
              onPointerDown={begin}
              onPointerMove={move}
              onPointerUp={finish}
              onPointerCancel={cancel}
              onLostPointerCapture={cancel}
            >
              <title>Editable vector drawing canvas</title>
              {project.layers.map((layer) => (
                <g
                  key={layer.id}
                  data-layer-id={layer.id}
                  visibility={layer.visible ? "visible" : "hidden"}
                >
                  {project.drawings
                    .find((d) => d.id === layer.drawingId)!
                    .strokes.map((stroke) => (
                      <StrokeView key={stroke.id} stroke={stroke} />
                    ))}
                  {preview?.layerId === layer.id &&
                    preview.tool === "brush" && (
                      <g opacity="0.65">
                        <StrokeView
                          stroke={{
                            id: "preview",
                            color: preview.color,
                            size: preview.size,
                            points: preview.points,
                          }}
                        />
                      </g>
                    )}
                </g>
              ))}
              {preview?.tool === "eraser" && (
                <path
                  d={strokePath(preview.points)}
                  fill="none"
                  stroke="#ea6757"
                  strokeWidth={preview.size}
                  strokeLinecap="round"
                  opacity="0.4"
                />
              )}
            </svg>
          </div>
          <p className="canvas-help">
            {tool === "brush"
              ? "Draw with your mouse, pen, or touch."
              : "Whole-stroke eraser: touched strokes are removed on release."}{" "}
            One gesture, one undo step.
          </p>
        </section>
        <aside aria-label="Layers">
          <div className="layers-heading">
            <h2>Layers</h2>
            <button
              disabled={project.layers.length >= LIMITS.layers || !!preview}
              onClick={addLayer}
            >
              Add layer
            </button>
          </div>
          <p className="hint">Top row draws on top. Select a layer to draw.</p>
          <ol className="layer-list">
            {[...project.layers].reverse().map((layer) => {
              const index = project.layers.indexOf(layer);
              return (
                <li
                  key={layer.id}
                  className={active.id === layer.id ? "selected" : ""}
                >
                  <div className="layer-select">
                    <button
                      className="layer-name"
                      aria-pressed={active.id === layer.id}
                      onClick={() => setActiveLayer(layer.id)}
                    >
                      {layer.name}
                    </button>
                    <input
                      type="checkbox"
                      aria-label={`Show ${layer.name}`}
                      checked={layer.visible}
                      disabled={!!preview}
                      onChange={(e) =>
                        dispatch({
                          type: "layer.visibility",
                          layerId: layer.id,
                          visible: e.target.checked,
                        })
                      }
                    />
                  </div>
                  <div className="layer-actions">
                    <button
                      aria-label={`Move ${layer.name} up`}
                      disabled={
                        index === project.layers.length - 1 || !!preview
                      }
                      onClick={() =>
                        dispatch({
                          type: "layer.move",
                          layerId: layer.id,
                          index: index + 1,
                        })
                      }
                    >
                      ↑
                    </button>
                    <button
                      aria-label={`Move ${layer.name} down`}
                      disabled={index === 0 || !!preview}
                      onClick={() =>
                        dispatch({
                          type: "layer.move",
                          layerId: layer.id,
                          index: index - 1,
                        })
                      }
                    >
                      ↓
                    </button>
                    <span>
                      {
                        project.drawings.find((d) => d.id === layer.drawingId)!
                          .strokes.length
                      }{" "}
                      strokes
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
          <label className="rename">
            Selected layer name
            <input
              key={active.id + active.name}
              aria-label="Selected layer name"
              defaultValue={active.name}
              maxLength={80}
              disabled={!!preview}
              onBlur={(e) => {
                if (e.target.value !== active.name)
                  dispatch({
                    type: "layer.rename",
                    layerId: active.id,
                    name: e.target.value,
                  });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
            />
          </label>
          <p className="hint">
            Up to 32 layers · 20,000 points
            <br />
            Undo history: up to 40 edits, bounded by geometry.
          </p>
        </aside>
      </div>
      <footer>
        <span role="status" aria-label="Drawing status">
          {error ||
            `Ready · ${active.name}${active.visible ? "" : " (hidden)"}`}
        </span>
        <span>Revision {revision} · No animation or file saving yet</span>
      </footer>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
