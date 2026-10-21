# MCP connection and security

BUILD 000 uses the official TypeScript MCP SDK with stdio transport. It exposes only `kreynima_status`, with an empty input schema and read-only annotations. The result describes the foundation, not a running desktop session. No port is opened and no shell/Python/filesystem tool is exposed. SDK annotations are hints; actual safety comes from the restricted implementation.

Build with `npm run build`. In a desktop MCP client that supports local stdio servers, configure a server command using the absolute Node executable and absolute `apps/mcp-server/dist/index.js` path:

```json
{
  "mcpServers": {
    "kreynima": {
      "command": "/absolute/path/to/node",
      "args": ["/absolute/path/to/kreynima/apps/mcp-server/dist/index.js"]
    }
  }
}
```

Use the client's platform-specific configuration location and Windows path escaping. Keep the repository's node_modules installed; external SDK imports remain runtime dependencies. `npm run mcp` is convenient for a terminal but direct node invocation avoids npm stdout interfering with protocol framing.

ChatGPT and Claude integrations depend on each product's currently supported MCP transports, plans, and client capabilities. A web client may not support spawning local stdio processes. BUILD 000 does not provide remote/web MCP connectivity or claim verified client compatibility.

A future shared-session bridge needs explicit pairing, authenticated per-session capabilities, project scope, revocation, timeouts, auditing with redaction, and user approval of destructive actions. Remote transport would additionally need supported authorization, origin/host checks, TLS, and DNS-rebinding protections. Do not bind an unauthenticated local server to a public interface. Treat all tool input as untrusted and enforce size/rate limits before mutation. External AI providers control their own data policies; users must consent before project data leaves the device.
