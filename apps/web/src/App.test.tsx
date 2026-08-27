import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('merender halaman ringkasan pada route root', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Ringkasan' })).toBeTruthy();
  });
});