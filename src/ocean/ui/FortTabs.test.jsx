import { afterEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/utils'
import es from '../../i18n/es.json'
import { FortContent } from './IslandContent'
import { getUi, resetSession } from '../store'

afterEach(() => resetSession());

describe('game island tabs', () => {
  it('shows Combat by default and switches to Race with the arrow keys', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FortContent />);
    const combat = screen.getByRole('tab', { name: new RegExp(es.ocean.menu.combat) });
    const race = screen.getByRole('tab', { name: new RegExp(es.ocean.menu.race) });
    expect(combat).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent(es.ocean.fort.intro);

    combat.focus();
    await user.keyboard('{ArrowRight}');
    expect(race).toHaveFocus();
    expect(race).toHaveAttribute('aria-selected', 'true');
    expect(race).toHaveAttribute('tabindex', '0');
    expect(combat).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tabpanel')).toHaveTextContent(es.ocean.fort.race_pick);
  });

  it('starts a race from the Race tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FortContent />);
    await user.click(screen.getByRole('tab', { name: new RegExp(es.ocean.menu.race) }));
    await user.click(screen.getByRole('button', { name: new RegExp(es.ocean.menu.difficulty.medium) }));
    expect(getUi()).toMatchObject({ mode: 'race' });
    expect(getUi().race.difficulty).toBe('medium');
  });
});
