---
title: Augmentasi tipe Express wajib devDep langsung @types/express-serve-static-core
category: gotcha
impact: medium
created: '2026-08-26T06:56:22.305Z'
updated: '2026-08-26T06:56:22.305Z'
source: agent
tags:
  - pnpm
  - typescript
  - express
  - module-augmentation
  - fnd-03
project: dashboard-divisi
related_files:
  - apps/api/src/types/express.d.ts
  - apps/api/src/common/trace-id.middleware.ts
  - apps/api/package.json
---
## Discovery

Di monorepo pnpm (strict node_modules), module augmentation TypeScript terhadap tipe Express butuh dependensi DEV LANGSUNG di apps/api: "@types/express": "^5" DAN "@types/express-serve-static-core": "^5". Tanpa yang kedua, declare module 'express-serve-static-core' menjadi ambient declaration terisolasi yang TIDAK menyatu dengan Request asli (yang dipakai via import dari 'express'), sehingga properti tambahan seperti req.traceId tidak dikenali meski sintaks augmentation tampak benar. Runtime express 5.x dibawa @nestjs/platform-express; kita hanya butuh tipenya, bukan runtime-nya.

## Context

FND-03 langkah middleware trace_id: kode owner sudah benar tapi typecheck gagal TS2307 lalu TS2339 pada req.traceId.

## Recommendation

Saat meng-augmentasi tipe library apa pun di repo ini, pastikan package @types targetnya adalah devDependency langsung dari workspace yang memakainya. Pola ini akan berulang saat integrasi passport/auth (augmentasi Express.Request/User).

## Related Files

- `apps/api/src/types/express.d.ts`
- `apps/api/src/common/trace-id.middleware.ts`
- `apps/api/package.json`
