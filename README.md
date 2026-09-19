# Incident Console

React + TypeScript + Vite app for tracking production incidents, services, and workspace settings.

## Quick start

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck and production build |
| `npm run test` | Run Vitest once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Project layout

```
src/
  api.ts          In-memory API (swap for real HTTP when ready)
  data.ts         Seed incidents and services
  queryKeys.ts    TanStack Query key factory
  pages/          Route screens
  components/     Shared UI
  test/           Test helpers and setup
mcp/              Stdio MCP server for workshop/agent tooling
workshop-data/    JSON datasets used by the MCP server
```

## Routes

- `/` — Dashboard
- `/incidents` — Paginated incident list with search and status filter
- `/incidents/:id` — Incident detail and acknowledge action
- `/services` — Service health grid
- `/settings` — Workspace preferences (static for now)

## MCP (optional)

VS Code / Cursor can attach the local MCP server via `.vscode/mcp.json`. Tools: `list_incidents`, `get_incident`, `list_service_health`, `get_recent_deploys`, `search_logs`.

Run from the repo root so `workshop-data/` resolves correctly:

```bash
node mcp/server.mjs
```
