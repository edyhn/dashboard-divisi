# FND-03 — NestJS Shell: /api/v1, Error Envelope, trace_id, Health

**Status:** DONE · **Selesai:** 2026-08-26 · **Mode:** coaching campur takeover
**Kontrak acuan:** API Contract §2 (envelope), §13.1 (error code), §13.3 (observability)

## Apa yang dibangun

```
Request → app.use(traceIdMiddleware) → Router → Controller
              ↓ error kapan pun                    ↓ sukses
        AllExceptionsFilter                ApiEnvelopeInterceptor
        {error:{code,message,trace_id}}    {data,meta:{trace_id},links}
```

- `common/api-error.ts` — class error bisnis; kode→HTTP dari satu map (`API_ERROR_HTTP_STATUS`) yang disalin dari registry §13.1
- `common/trace-id.middleware.ts` — UUID per request via `app.use()` (bukan MiddlewareConsumer, agar jalan juga di route liar/404)
- `common/all-exceptions.filter.ts` — 3 cabang: `ApiError` → `HttpException` → unknown (pesan generik, stack hanya ke logger)
- `common/api-envelope.interceptor.ts` — membungkus hasil controller (RxJS `map`)
- `health/` — endpoint minimal tanpa info sensitif (§13.3)
- `app.setup.ts` — wiring diekstrak agar main.ts & test memakai setup identik

## Pelajaran kunci

1. **Alur request NestJS**: middleware → guard → pipe → controller → interceptor → response; error dari titik mana pun masuk exception filter.
2. **Pemisahan peran**: controller polos; envelope dipasang interceptor/filter. Error bisnis tidak tahu soal HTTP.
3. **Module augmentation Express di pnpm strict**: wajib devDep langsung `@types/express@^5` **dan** `@types/express-serve-static-core@^5` — kalau tidak, `declare module` mengudara sendirian dan properti tambahan (`req.traceId`) tak dikenali.
4. **File yang belum diimpor = belum terverifikasi** — typecheck senyap bukan bukti file ada (kasus api-error.ts).
5. **Enum key indexing**: indeks map berkunci enum butuh cast (`status as HttpStatus`); fallback `??` menutup nilai tak terdaftar.
6. **Test kontrak via HTTP nyata**: `Test.createTestingModule` → `configureApp(app)` → `app.listen(0)` → `fetch` bawaan Node 22. Trik *probe controller* melempar pesan rahasia lalu assert tidak bocor = bukti P0 sanitasi.

## Hasil verifikasi

- Smoke live: health envelope ✓, 404 RESOURCE_NOT_FOUND ter-envelop ✓, prefix aktif ✓, trace_id unik per request ✓
- Gates: typecheck/build/lint/test **12/12** hijau (termasuk 4 test kontrak baru)

## File terkait

`apps/api/src/{main.ts,app.setup.ts,app.module.ts}` · `apps/api/src/common/*` · `apps/api/src/health/*` · `apps/api/src/app.contract.spec.ts`
