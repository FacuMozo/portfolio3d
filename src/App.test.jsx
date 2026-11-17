import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { renderWithProviders } from './test/utils'
import { AppRoutes } from './App'

// The 3D variants need WebGL; stub them to test routing and lazy loading only.
vi.mock('./pages/Ocean', () => ({ default: () => <p>ocean-stub</p> }));
vi.mock('./pages/Classic', () => ({ default: () => <p>classic-stub</p> }));

const LocationProbe = () => {
  const { pathname, hash } = useLocation();
  return <output data-testid='location'>{pathname + hash}</output>;
};

const renderAt = (route) =>
  renderWithProviders(
    <>
      <AppRoutes />
      <Routes><Route path='*' element={<LocationProbe />} /></Routes>
    </>,
    { route },
  );

describe('routing', () => {
  it('serves the professional site at /', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1, name: /facundo mozo/i })).toBeInTheDocument();
  });

  it('lazy-loads the ocean variant at /ocean', async () => {
    renderAt('/ocean');
    expect(await screen.findByText('ocean-stub')).toBeInTheDocument();
  });

  it('keeps the classic variant at /classic', async () => {
    renderAt('/classic');
    expect(await screen.findByText('classic-stub')).toBeInTheDocument();
  });

  it.each([
    ['/about', '/#experience'],
    ['/projects', '/#work'],
    ['/contact', '/#contact'],
    ['/does-not-exist', '/'],
  ])('redirects %s to %s', async (from, to) => {
    renderAt(from);
    expect(await screen.findByTestId('location')).toHaveTextContent(new RegExp(`^${to}$`));
  });
});
