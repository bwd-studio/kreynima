import { createRoot } from "react-dom/client";
import { executeCommand, STATUS_COMMAND } from "@kreynima/command-engine";
import "./style.css";
const status = executeCommand({ type: STATUS_COMMAND });
createRoot(document.getElementById("root")!).render(
  <main>
    <p className="eyebrow">BuildWithDani · BUILD {status.build}</p>
    <h1>KREYNIMA</h1>
    <p>An editable animation studio for artists and AI collaborators.</p>
    <section aria-label="Development status">
      <h2>Development foundation</h2>
      <p>The shared command engine is ready. No project is open.</p>
      <p>
        Drawing, animation, saving, rendering, and desktop MCP control are
        planned for later builds.
      </p>
    </section>
  </main>,
);
