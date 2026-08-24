import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('menampilkan judul aplikasi', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Dashboard Divisi' })).toBeTruthy();
  });
});
