import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  EmptyState,
  ErrorState,
  LoadingState,
  NoAccessState,
} from './states';

describe('Komponen state', () => {
  afterEach(() => {
    cleanup();
  });

  it('LoadingState memakai role=status dan label yang diberikan', () => {
    render(<LoadingState label="Mengambil omzet..." />);

    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByText('Mengambil omzet...')).toBeTruthy();
  });

  it('EmptyState menampilkan judul, deskripsi, dan aksi', () => {
    render(
      <EmptyState
        title="Belum ada impor"
        description="Unggah file Excel untuk memulai."
        action={<button type="button">Unggah</button>}
      />,
    );

    expect(screen.getByText('Belum ada impor')).toBeTruthy();
    expect(screen.getByText('Unggah file Excel untuk memulai.')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Unggah' }),
    ).toBeTruthy();
  });

  it('ErrorState memanggil onRetry saat tombol ditekan', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Coba Lagi' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('ErrorState tanpa onRetry tidak merender tombol', () => {
    render(<ErrorState />);

    expect(
      screen.queryByRole('button', { name: 'Coba Lagi' }),
    ).toBeNull();
  });

  it('NoAccessState menampilkan pesan default', () => {
    render(<NoAccessState />);

    expect(screen.getByText('Akses ditolak')).toBeTruthy();
    expect(
      screen.getByText('Role Anda tidak memiliki izin untuk membuka halaman ini.'),
    ).toBeTruthy();
  });
});
