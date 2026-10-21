# Agent development rules

These rules apply to Cursor, Codex, Claude Code, and human-assisted agents throughout this repository.

- Keep desktop UI in apps/desktop, protocol transport in apps/mcp-server, shared behavior in packages. Rust owns narrowly scoped native operations. Do not duplicate drawing or animation logic in adapters.
- The desktop and MCP must use the same commands and project types. Add parity tests whenever either gains behavior. Never claim the standalone MCP process controls a live desktop until a tested session bridge exists.
- Scope edits to the requested build. Preserve user changes and history. No destructive changes, broad deletion, history rewriting, or merging without approval.
- Review CODEOWNERS; obtain relevant maintainer review for changes. When multiple agents work, agree on file ownership before editing and do not overwrite another agent's work.
- Run npm run check. For Rust/native changes run cargo fmt --check, cargo check, cargo test, and the native build where supported. Report unavailable checks explicitly. Add behavior tests for commands, validation, serialization, and security boundaries as those features arrive.
- Validate all external input. Never expose arbitrary shell/Python execution over MCP, widen Tauri permissions casually, commit secrets, disable TLS validation, or introduce unsolicited outbound telemetry. Keep stdout exclusively for MCP protocol.
- Preserve GPL notices and corresponding-source obligations. Review dependency licenses and provenance. Keep promotional branding distinct from GPL program assets; never assert GPL prohibits commercial forks.
- Describe implemented behavior accurately. Planned engines, tools, export, rigs, cameras, or AI workflows are not complete features. Avoid fake buttons and demonstrations presented as functioning tools.
- End changes with a plain-English summary of what changed, why, tests run, and unresolved limitations. Do not claim Windows/macOS support has been verified without actual evidence.
