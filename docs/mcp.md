# MCP connection and security

BUILD 001 uses the official TypeScript MCP SDK with stdio transport. It exposes `kreynima_status` (stateless capabilities), `kreynima_project` (read isolated project/revision), and `kreynima_command` (validated local edits). The first two use strict empty input objects and read-only annotations; command uses the shared request schema and is annotated as potentially destructive. It does not control a running desktop session. No port is opened and no shell/Python/filesystem tool is exposed. SDK annotations are hints; actual safety comes from the restricted implementation.

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

ChatGPT and Claude integrations depend on each product's currently supported MCP transports, plans, and client capabilities. A web client may not support spawning local stdio processes. BUILD 001 does not provide remote/web MCP connectivity or claim verified client compatibility.

A future shared-session bridge needs explicit pairing, authenticated per-session capabilities, project scope, revocation, timeouts, auditing with redaction, and user approval of destructive actions. Remote transport would additionally need supported authorization, origin/host checks, TLS, and DNS-rebinding protections. Do not bind an unauthenticated local server to a public interface. Treat all tool input as untrusted and enforce size/rate limits before mutation. External AI providers control their own data policies; users must consent before project data leaves the device.

## Drawing command example

Start with `kreynima_project` and `{}`. Use the returned revision for each command, then use the next returned revision. For a fresh process:

```json
{
  "command": {
    "type": "stroke.add",
    "layerId": "layer-1",
    "stroke": {
      "id": "stroke-example",
      "color": "#2277cc",
      "size": 8,
      "points": [
        { "x": 100, "y": 100, "pressure": 0.5 },
        { "x": 200, "y": 160, "pressure": 0.5 }
      ]
    }
  },
  "expectedRevision": 0
}
```

Send that object to `kreynima_command`. All [shared drawing commands](commands.md) are available through this same tool. Errors return `isError` without partial mutations. The project is temporary and process-local; read results show editable vectors, but the desktop canvas will not change. Restarting the server resets the project. No file-saving or client compatibility is implied by protocol integration tests. Local stdio access is controlled by whoever launches the process; this is not an authenticated multi-user service. A desktop bridge with consent/pairing and request-rate controls remains future work.
