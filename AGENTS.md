# AGENTS.md

A TypeScript MCP server on the official
[MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk) that deploys
to foro.sh. README.md covers the layout.

## Commands

- `npm test` runs the tests, including one that starts `server.ts` and calls
  its tools over HTTP.
- `npm start` serves at `http://localhost:8000/mcp`.
- `uvx foro check` runs the checks foro.sh runs at deploy time (needs uv).

## Working here

- **Re-lock after every dependency change.** Use `npm install <pkg>` /
  `npm uninstall <pkg>`, or run `npm install` after editing `package.json`, and
  commit `package-lock.json` with it. Deploys install from the lockfile as-is
  with `npm ci`, which fails when the two disagree.
- One tool per file in `tools/`, each exporting a function that registers it,
  like `registerAdd`. Call it from `createMcpServer()` in `app.ts`: an
  unregistered tool is silently not served. Test it in `tests/`.
- Node runs the `.ts` files directly by stripping types, with no build step.
  Relative imports need the `.ts` extension, and only erasable syntax works: no
  `enum`, `namespace` or constructor parameter properties.
- `server.ts` serves streamable HTTP at `/mcp` on `$PORT`, with a new server
  and transport per request. Keep all three.
- Read secrets from `process.env`. Locally they come from `.env`; deployed, from
  the Secrets tab in the foro.sh dashboard. Never commit one.
- `.foro/` is scratch space, such as API specs fetched to query with `jq`. It is
  gitignored.

## Skills

`.claude/skills/` holds `design-mcp-tools`, `wrap-an-http-api` and
`deploy-to-foro`. Before writing a client for any external API, follow
`wrap-an-http-api`: an endpoint recalled from memory deploys green and 404s.
