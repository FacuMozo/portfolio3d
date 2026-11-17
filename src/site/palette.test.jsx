import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test/utils'
import es from '../i18n/es.json'
import HeroArt from './sections/HeroArt'
import { getPaletteState, nextPalette, resetPaletteState, setPalette } from './palette'

beforeEach(() => {
  resetPaletteState();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => vi.useRealTimers());

const cubes = () => screen.getAllByRole('button', { name: /Cubo \d de 3/ });

describe('palette store', () => {
  it('applies the palette to <html data-palette> and remembers it', async () => {
    await setPalette('sunset');
    expect(document.documentElement.dataset.palette).toBe('sunset');
    expect(localStorage.getItem('site_palette')).toBe('sunset');
    expect(getPaletteState().palette).toBe('sunset');
  });

  it('cycles through the four palettes', () => {
    expect(nextPalette('violet')).toBe('matrix');
    expect(nextPalette('ocean')).toBe('violet');
  });
});

describe('hero cubes easter egg', () => {
  it('cubes are toggle buttons; the picker is hidden until all three are lit', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<HeroArt />);
    expect(cubes()).toHaveLength(3);
    expect(screen.queryByRole('group', { name: es.site.palette.legend })).not.toBeInTheDocument();

    await user.click(cubes()[0]);
    expect(cubes()[0]).toHaveAttribute('aria-pressed', 'true');
    await user.click(cubes()[0]);
    expect(cubes()[0]).toHaveAttribute('aria-pressed', 'false');
  });

  it('lighting the three unlocks the palettes, switches to Matrix and shows the picker', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<HeroArt />);
    for (const cube of cubes()) await user.click(cube);
    await act(() => vi.advanceTimersByTimeAsync(700));

    expect(document.documentElement.dataset.palette).toBe('matrix');
    expect(screen.getByRole('status')).toHaveTextContent(es.site.palette.unlocked);
    const picker = screen.getByRole('group', { name: es.site.palette.legend });
    const radios = within(picker).getAllByRole('radio');
    expect(radios).toHaveLength(4);
    expect(within(picker).getByRole('radio', { name: es.site.palette.names.matrix })).toBeChecked();

    await user.click(within(picker).getByRole('radio', { name: es.site.palette.names.ocean }));
    expect(document.documentElement.dataset.palette).toBe('ocean');

    // Cubes reset; lighting them again moves on to the next palette.
    await act(() => vi.advanceTimersByTimeAsync(1200));
    for (const cube of cubes()) await user.click(cube);
    await act(() => vi.advanceTimersByTimeAsync(700));
    expect(document.documentElement.dataset.palette).toBe('violet');
  });
});
