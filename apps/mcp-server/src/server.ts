import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  statusTool,
  createProjectTools,
  requestSchema,
} from "@kreynima/agent-tools";
import { CommandError } from "@kreynima/command-engine";
export function createServer() {
  const server = new McpServer({ name: "kreynima", version: "0.0.0" });
  const tools = createProjectTools();
  const content = (value: unknown) => ({
    content: [{ type: "text" as const, text: JSON.stringify(value) }],
  });
  server.registerTool(
    statusTool.name,
    {
      description: statusTool.description,
      inputSchema: z.object({}).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => content(statusTool.run()),
  );
  server.registerTool(
    "kreynima_project",
    {
      description:
        "Read this MCP process's isolated, temporary drawing project and revision. Not the open desktop. Lost when this process exits.",
      inputSchema: z.object({}).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => content(tools.read()),
  );
  server.registerTool(
    "kreynima_command",
    {
      description:
        "Edit this process's temporary vector project using the shared command engine. Supports strokes (add/whole-stroke erase), layers (add/rename/visibility/order), project rename, undo/redo. Read kreynima_project first; expectedRevision is required. No live desktop connection or file access.",
      inputSchema: requestSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (request) => {
      try {
        return content(tools.command(request));
      } catch (error) {
        return {
          ...content({
            error: error instanceof CommandError ? error.code : "VALIDATION",
            message: error instanceof Error ? error.message : "Invalid request",
          }),
          isError: true,
        };
      }
    },
  );
  return server;
}
