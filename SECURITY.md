# Security policy

BUILD 000 is unreleased development software. There are no supported production versions or response-time guarantees. Security fixes target the default branch.

Use GitHub's private vulnerability reporting feature if enabled: https://github.com/bwd-studio/kreynima/security/advisories/new . If unavailable, request a private reporting channel from a maintainer without publishing exploit details or secrets. Maintainers must enable private reporting or establish a verified confidential contact before release; no email address is assumed here.

Include affected revision, reproduction, impact, and a minimal redacted example. Coordinate public disclosure after a fix when possible.

MCP currently supports stdio and a read-only status tool only. Never add arbitrary shell/Python execution. Treat projects, paths, imported media, and tool input as untrusted. Future mutation tools require schema validation, user consent for destructive actions, bounded resource use, and explicit project authority. Do not log project content or credentials by default. Tauri has no native commands/plugins or privileged frontend capabilities in this build.
