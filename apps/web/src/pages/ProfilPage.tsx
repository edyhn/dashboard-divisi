import { StatusPill } from '../components/StatusPill';
import { useSession } from '../session/SessionContext';

const selfService = [
  { label: 'Jadwal hari ini', value: 'Shift pagi · 08:00-16:00', visibility: 'Hanya data sendiri' },
  { label: 'Absensi terakhir', value: 'Check-in 07:54 · Normal', visibility: 'Tanpa data rekan kerja' },
  { label: 'Cuti', value: '1 pending · 0 aktif', visibility: 'Riwayat pribadi' },
  { label: 'Lembur minggu ini', value: '4 jam', visibility: 'Tanpa nominal payroll' },
];

const securityItems = [
  { title: 'Password', detail: 'Reset password akan tersedia setelah integrasi auth UI.', status: 'Planned' },
  { title: 'Session', detail: 'Logout server-side sudah memblokir token lama pada baseline FND-06.', status: 'Ready' },
  { title: 'Scope', detail: 'Role demo menentukan menu dan akses halaman yang tampil.', status: 'Mock' },
];

export default function ProfilPage() {
  const { user } = useSession();

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Akun</p>
            <h1 className="mt-1 text-2xl font-semibold text-navy">Profil Saya</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Self-view mock untuk session demo, scope role, keamanan akun, dan ringkasan pribadi tanpa membuka data sensitif.</p>
          </div>
          <button type="button" className="rounded-input border border-line px-4 py-2 text-sm font-medium text-navy">Edit preferensi</button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-white">
            {user.name.slice(0, 1)}
          </div>
          <h2 className="mt-4 text-lg font-semibold text-navy">{user.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{user.role}</p>
          <p className="mt-1 text-sm text-slate-500">{user.divisionCode ?? 'Semua divisi'}</p>
          <div className="mt-4 rounded-card bg-surface p-4 text-sm text-slate-600">
            Session demo tersimpan lokal dan dapat diganti dari RoleSwitcher.
          </div>
        </article>

        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">Self-service pribadi</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {selfService.map((item) => (
              <div key={item.label} className="rounded-card border border-line p-4">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 font-semibold text-navy">{item.value}</p>
                <p className="mt-2 text-sm text-slate-500">{item.visibility}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">Keamanan akun</h2>
          <div className="mt-4 space-y-3">
            {securityItems.map((item) => (
              <div key={item.title} className="rounded-card border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-navy">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                  </div>
                  <StatusPill status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-card border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-navy">Privacy guard</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p className="rounded-card border border-line p-4">USER hanya melihat profil, jadwal, absensi, cuti, dan lembur milik sendiri.</p>
            <p className="rounded-card border border-line p-4">Payroll detail dan data karyawan lain tidak ditampilkan di self-view.</p>
            <p className="rounded-card border border-line p-4">Menu mengikuti capability role aktif, bukan hardcode halaman.</p>
          </div>
        </article>
      </section>
    </div>
  );
}
