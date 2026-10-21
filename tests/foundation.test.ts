import { test } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { executeCommand, STATUS_COMMAND } from "@kreynima/command-engine";

test("status is deterministic and rejects unknown commands", () => {
  const result = executeCommand({ type: STATUS_COMMAND });
  assert.equal(result.projectOpen, false);
  assert.deepEqual(result.capabilities, [STATUS_COMMAND]);
  // Runtime boundary must also fail closed for untyped clients.
  assert.throws(() =>
    executeCommand({ type: "shell" as typeof STATUS_COMMAND }),
  );
});
test("stdio MCP initializes, lists only status, calls it, and rejects unknown tools", async () => {
  const client = new Client({ name: "foundation-test", version: "0.0.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["apps/mcp-server/dist/index.js"],
  });
  try {
    await client.connect(transport);
    const { tools } = await client.listTools();
    assert.deepEqual(
      tools.map((tool) => tool.name),
      ["kreynima_status"],
    );
    const result = await client.callTool({
      name: "kreynima_status",
      arguments: {},
    });
    assert.deepEqual(result.content, [
      {
        type: "text",
        text: JSON.stringify(executeCommand({ type: STATUS_COMMAND })),
      },
    ]);
    const rejected = await client.callTool({ name: "shell", arguments: {} });
    assert.equal(rejected.isError, true);
  } finally {
    await client.close();
  }
});
