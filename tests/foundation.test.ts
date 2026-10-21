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
test(
  "stdio MCP exposes only read-only status and rejects execution requests",
  { timeout: 15000 },
  async () => {
    const client = new Client({ name: "foundation-test", version: "0.0.0" });
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ["apps/mcp-server/dist/index.js"],
    });
    try {
      await client.connect(transport);
      const capabilities = client.getServerCapabilities();
      assert.ok(capabilities?.tools);
      assert.equal(capabilities?.resources, undefined);
      assert.equal(capabilities?.prompts, undefined);
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
      assert.equal(tools[0].annotations?.readOnlyHint, true);
      assert.equal(tools[0].inputSchema.additionalProperties, false);
      for (const name of [
        "shell",
        "python",
        "exec",
        "application.status",
        "unknown",
      ]) {
        const rejected = await client.callTool({ name, arguments: {} });
        assert.equal(rejected.isError, true, `${name} must be rejected`);
      }
      const injected = await client.callTool({
        name: "kreynima_status",
        arguments: { command: "shell", code: "print('untrusted input')" },
      });
      assert.equal(injected.isError, true, "status accepts no arguments");
      const afterRejection = await client.callTool({
        name: "kreynima_status",
        arguments: {},
      });
      assert.deepEqual(afterRejection.content, result.content);
    } finally {
      await client.close();
    }
  },
);
