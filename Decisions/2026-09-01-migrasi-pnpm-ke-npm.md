# 2026-09-01 — Migrasi pnpm → npm

**Konteks:** Owner minta ganti package manager dari pnpm ke npm untuk kemudahan. Repo awal `packageManager: pnpm@11.23.0` + `pnpm-workspace.yaml` + `pnpm-lock.yaml`.

**Keputusan:** Migrasi ke npm workspaces (npm 11.17.0, Node 24). `package.json` tambah `workspaces: ["apps/*","packages/*"]`, scripts `pnpm -r` → `npm run --workspaces --if-present`, `pnpm --filter` → `npm --workspace`. Dependency `@dashboard-divisi/contracts: workspace:*` → `*` (npm tidak support `workspace:` protocol, `*` auto-link via workspaces). `pnpm-workspace.yaml` & `pnpm-lock.yaml` dihapus, `node_modules` dibersihkan (pnpm `.pnpm` store membingungkan arborist → error `Link.matches`), `npm install` 330 packages, `package-lock.json` baru. `CORS` & `SESSION_DRIVER` dibetulkan untuk BE real.

**Dampak:** CI yang masih pakai `pnpm/action-setup` perlu diganti `actions/setup-node` + `npm ci` — dicatat sebagai utang. Dev workflow: `npm install`, `npm run dev --workspace=@dashboard-divisi/web`, `npm run test`.

**Alternatif ditolak:** Tetap pnpm — owner eksplisit minta npm.
