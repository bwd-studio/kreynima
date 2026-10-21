import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { statusTool } from "@kreynima/agent-tools";
export function createServer() {
  const server = new McpServer({ name: "kreynima", version: "0.0.0" });
  server.registerTool(
    statusTool.name,
    {
      description: statusTool.description,
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => ({
      content: [
        { type: "text" as const, text: JSON.stringify(statusTool.run()) },
      ],
    }),
  );
  return server;
}
