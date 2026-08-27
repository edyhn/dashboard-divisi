import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

function Boom(): never {
  throw new Error('Uji crash terkontrol');
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('menampilkan fallback alih-alih children saat render error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(
      screen.getByRole('heading', { name: 'Terjadi kesalahan tak terduga' }),
    ).toBeTruthy();
    expect(screen.getByText('Uji crash terkontrol')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Kembali ke Beranda' }),
    ).toBeTruthy();
  });

  it('menampilkan children normal saat tidak ada error', () => {
    render(
      <ErrorBoundary>
        <p>Aman dan sehat</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('Aman dan sehat')).toBeTruthy();
    expect(
      screen.queryByRole('heading', { name: 'Terjadi kesalahan tak terduga' }),
    ).toBeNull();
  });
});
