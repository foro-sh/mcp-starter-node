# mcp-server

A TypeScript MCP server on the official
[MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk), ready to
deploy on [foro.sh](https://foro.sh). It ships with one example tool, `add`, so
everything below works before you've written a tool of your own.

There's no build step: Node runs the `.ts` files directly by stripping their
types, locally and on foro.sh.

## Layout

- `server.ts` is the entrypoint foro.sh starts (`main` in `package.json`). It
  serves streamable HTTP at `/mcp` on `$PORT`, with a fresh server and
  transport for each request.
- `app.ts` builds that server and registers every tool on it.
- `tools/` has one file per tool. Each exports the tool's logic and a function
  that registers it; add that function to `createMcpServer()` in `app.ts`.
- `tests/` is [Vitest](https://vitest.dev). `tools.test.ts` tests `add`, then
  starts `server.ts` in its own process and calls the tool over HTTP, since a
  tool that never got registered doesn't stop the server from starting.

## Run it locally

You need Node 22.18 or newer.

```bash
npm install
npm start
```

The server is then at `http://localhost:8000/mcp`, so any MCP client can
connect to it:

```bash
claude mcp add --transport http mcp-server http://localhost:8000/mcp
```

If a tool needs an API key or another secret, copy `.env.example` to `.env`
and fill it in. `npm start` loads it, and the code reads it from `process.env`.
`.env` is never committed or deployed.

## Test

```bash
npm test
```

## Dependencies

Add packages with `npm install <package>`, which updates `package.json` and
`package-lock.json` together, and commit both. foro.sh installs with `npm ci`,
which uses the lockfile exactly as committed and fails the build when it
disagrees with `package.json`.

## Deploy to foro.sh

1. Push this repo to GitHub.
2. In the [foro.sh](https://foro.sh) dashboard, create a project from it and
   add any secrets your tools read under **Secrets**.
3. Deploy. The server comes up at `https://<slug>.foro.sh/mcp`, with a slug
   foro.sh generates.

To ship a change later, push and press **Redeploy**. If you have
[uv](https://docs.astral.sh/uv/), `uvx foro check` runs foro.sh's deploy checks
locally first.

## Agent skills

`.claude/skills/` holds three skills for coding agents working in this repo.
Claude Code picks them up automatically.

- **design-mcp-tools**: shaping tool names, descriptions and parameters so a
  model picks the right tool and they're cheap to include in every request.
- **wrap-an-http-api**: building tools on an existing API from its real spec,
  not from half-remembered endpoints.
- **deploy-to-foro**: shipping to foro.sh, and reading the logs when a deploy
  fails.

They're copied from
[foro-sh/foro](https://github.com/foro-sh/foro/tree/main/plugins/claude-code/skills).
Once they're in your repo they're yours, so edit or delete them as the project
grows. `AGENTS.md` has the short version of how to work here.
