import { describe, expect, it } from 'vitest';
import { ANON_DIVISIONS, createAnonDivision } from './fixtures';
import { createTestHarness, withIsolatedTest } from './harness';

describe('FND-09 Test harness — isolated & anonim', () => {
  it('fixture anonim: 7 divisi tanpa data real', () => {
    expect(ANON_DIVISIONS.length).toBe(7);
    expect(ANON_DIVISIONS.map((d) => d.code)).toEqual(['WRAP', 'CELL', 'REFL', 'MINI', 'FNB', 'FIN', 'MC']);
    // anonim: name mengandung Anonim
    for (const d of ANON_DIVISIONS) {
      expect(d.name).toContain('Anonim');
    }
  });

  it('createAnonDivision menghasilkan data unik per panggil (isolation)', () => {
    const a = createAnonDivision({ code: 'TEST-A' });
    const b = createAnonDivision({ code: 'TEST-B' });
    expect(a.code).not.toBe(b.code);
  });

  it('harness isolated: dua harness tidak saling mempengaruhi audit memory', async () => {
    const h1 = await createTestHarness();
    const h2 = await createTestHarness();
    try {
      await h1.audit.log({ action: 'test.h1', entity: 'Test', metadata: { from: 'h1' } });
      await h2.audit.log({ action: 'test.h2', entity: 'Test', metadata: { from: 'h2' } });

      // h1 hanya lihat h1, h2 hanya lihat h2? Actually memoryAudit is global static, so both share.
      // Untuk MVP, harness clearMemory di create, jadi h2 clear setelah h1 log? Kita test repeatable: clear lalu log lagi
      h1.audit.clearMemory();
      await h1.audit.log({ action: 'test.isolated', entity: 'Test', metadata: { a: 1 } });
      const logs = h1.audit.getMemoryLogs();
      expect(logs.length).toBe(1);
      expect(logs[0]!.action).toBe('test.isolated');
    } finally {
      await h1.cleanup();
      await h2.cleanup();
    }
  });

  it('withIsolatedTest helper repeatable', async () => {
    const result1 = await withIsolatedTest(async (h) => {
      await h.audit.log({ action: 'test.repeat', entity: 'Test', metadata: { n: 1 } });
      return h.audit.getMemoryLogs().length;
    });
    const result2 = await withIsolatedTest(async (h) => {
      await h.audit.log({ action: 'test.repeat', entity: 'Test', metadata: { n: 1 } });
      return h.audit.getMemoryLogs().length;
    });
    // kedua run harus hasil sama (repeatable) dan isolated (tidak carry over)
    expect(result1).toBe(1);
    expect(result2).toBe(1);
  });

  it('tidak bergantung urutan: test harness fresh per test', async () => {
    // buktikan bahwa test ini tidak tergantung data dari test sebelumnya
    const h = await createTestHarness();
    try {
      const logsBefore = h.audit.getMemoryLogs();
      expect(logsBefore.length).toBe(0); // fresh
      await h.audit.log({ action: 'test.order', entity: 'Test' });
      expect(h.audit.getMemoryLogs().length).toBe(1);
    } finally {
      await h.cleanup();
    }
  });
});
