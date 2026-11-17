import { afterEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test/utils'
import es from '../i18n/es.json'
import { enterIsland, getUi, input, resetSession, setReducedMotion, startExploring, startPlaying, world } from './store'
import { step } from './sim'
import StartScreen from './ui/StartScreen'

afterEach(() => {
  resetSession();
  setReducedMotion(false);
});

describe('ocean start gate', () => {
  it('the ship ignores input until the player starts', () => {
    expect(getUi().started).toBe(false);
    const { x, z } = world.ship;
    input.forward = true;
    for (let i = 0; i < 30; i++) step(1 / 30);
    input.forward = false;
    expect([world.ship.x, world.ship.z]).toEqual([x, z]);
  });

  it('"Sail" starts exploring right away, without opening the help island', () => {
    startExploring();
    expect(getUi()).toMatchObject({ started: true, mode: 'explore', entering: null, openIsland: null });
  });

  it('with reduced motion, entering an island opens its modal straight away', () => {
    setReducedMotion(true);
    enterIsland('projects');
    expect(getUi()).toMatchObject({ entering: null, openIsland: 'projects' });
  });

  it('"Play" starts the chosen mode and shows the instructions first (sim paused under them)', () => {
    startPlaying('race', 'easy');
    expect(getUi()).toMatchObject({ started: true, mode: 'race', openIsland: 'help' });
    const countdown = world.race.countdown;
    step(1 / 30);
    expect(world.race.countdown).toBe(countdown);
  });

  it('once started and the instructions are closed, the ship sails', () => {
    startExploring();
    const { x, z } = world.ship;
    input.forward = true;
    for (let i = 0; i < 30; i++) step(1 / 30);
    input.forward = false;
    expect(Math.hypot(world.ship.x - x, world.ship.z - z)).toBeGreaterThan(0.1);
  });
});

describe('StartScreen', () => {
  it('offers Sail and Play; Play reveals the game modes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<StartScreen />);
    const sail = screen.getByRole('button', { name: new RegExp(es.ocean.start.sail) });
    expect(sail).toHaveFocus();

    await user.click(screen.getByRole('button', { name: new RegExp(es.ocean.start.play) }));
    expect(screen.getByText(es.ocean.start.choose)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(es.ocean.menu.combat) })).toHaveFocus();
    expect(screen.getAllByRole('button', { name: new RegExp(es.ocean.menu.race) })).toHaveLength(3);
  });

  it('Sail unlocks the controls', async () => {
    const user = userEvent.setup();
    renderWithProviders(<StartScreen />);
    await user.click(screen.getByRole('button', { name: new RegExp(es.ocean.start.sail) }));
    expect(getUi().started).toBe(true);
  });
});
