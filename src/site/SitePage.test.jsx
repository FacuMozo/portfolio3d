import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test/utils'
import { projects } from '../constants'
import es from '../i18n/es.json'
import en from '../i18n/en.json'
import SitePage from './SitePage'
import { ContactForm } from './sections/Contact'

const renderSite = () => renderWithProviders(<SitePage />);
const projectList = () => {
  const section = document.getElementById('work');
  // The project grid is the last list in the section (filters are buttons, chips are nested).
  return within(section).getAllByRole('list').find((ul) => ul.parentElement === section);
};

describe('SitePage', () => {
  it('renders one h1 and every section landmark', () => {
    renderSite();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    for (const id of ['home', 'expertise', 'work', 'experience', 'contact']) {
      expect(document.getElementById(id)).toBeInTheDocument();
    }
  });

  it('links the 3D ocean variant at /ocean', () => {
    renderSite();
    const links = screen.getAllByRole('link', { name: new RegExp(es.site.ocean.short + '|' + es.site.ocean.cta, 'i') });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) expect(link).toHaveAttribute('href', '/ocean');
  });

  it('switches language and keeps <html lang> in sync', async () => {
    const user = userEvent.setup();
    renderSite();
    expect(screen.getByRole('heading', { level: 2, name: es.site.expertise.title })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: es.navbar.langToggle_label }));

    expect(screen.getByRole('heading', { level: 2, name: en.site.expertise.title })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('en');
  });

  it('shows the real projects only (no placeholder testimonials)', () => {
    renderSite();
    expect(within(projectList()).getAllByRole('article')).toHaveLength(projects.length);
    expect(screen.queryByText(/Eduardo M\.|Luciana R\./)).not.toBeInTheDocument();
  });
});

describe('Work filters', () => {
  it('filters cards by category, with aria-pressed and matching counts', async () => {
    const user = userEvent.setup();
    renderSite();
    const group = screen.getByRole('group', { name: es.site.work.filters_label });
    const all = within(group).getByRole('button', { name: new RegExp(es.site.work.categories.all) });
    const mobile = within(group).getByRole('button', { name: new RegExp(es.site.work.categories.mobile) });
    expect(all).toHaveAttribute('aria-pressed', 'true');
    expect(mobile).toHaveAttribute('aria-pressed', 'false');

    await user.click(mobile);

    const mobileCount = projects.filter((p) => p.category === 'mobile').length;
    expect(mobile).toHaveAttribute('aria-pressed', 'true');
    expect(all).toHaveAttribute('aria-pressed', 'false');
    expect(within(projectList()).getAllByRole('article')).toHaveLength(mobileCount);
    expect(mobile).toHaveTextContent(`(${String(mobileCount).padStart(2, '0')})`);
    expect(screen.getByText(es.site.work.results.replace('{n}', mobileCount))).toBeInTheDocument();
  });
});

describe('Experience accordion', () => {
  it('uses native details: first role open, the rest closed, toggled by summary', async () => {
    const user = userEvent.setup();
    renderSite();
    const items = document.querySelectorAll('#experience details');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveAttribute('open');
    expect(items[1]).not.toHaveAttribute('open');

    await user.click(items[1].querySelector('summary'));
    expect(items[1]).toHaveAttribute('open');
    expect(items[0]).toHaveAttribute('open'); // not exclusive
  });
});

describe('ContactForm', () => {
  const fill = async (user) => {
    await user.type(screen.getByLabelText(es.contact.name_label), 'Ada');
    await user.type(screen.getByLabelText(es.contact.email_label), 'ada@example.com');
    await user.type(screen.getByLabelText(es.contact.message_label), 'Hola!');
    await user.click(screen.getByRole('button', { name: es.contact.send_btn }));
  };

  it('sends the message and announces success', async () => {
    const user = userEvent.setup();
    const send = vi.fn().mockResolvedValue({ status: 200 });
    renderWithProviders(<ContactForm send={send} />);
    await fill(user);

    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0][2]).toMatchObject({ from_name: 'Ada', from_email: 'ada@example.com', message: 'Hola!' });
    expect(await screen.findByRole('status')).toHaveTextContent(es.contact.success);
    expect(screen.getByLabelText(es.contact.name_label)).toHaveValue('');
  });

  it('keeps the data and offers the direct email on failure', async () => {
    const user = userEvent.setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const send = vi.fn().mockRejectedValue(new Error('network'));
    renderWithProviders(<ContactForm send={send} />);
    await fill(user);

    expect(await screen.findByRole('status')).toHaveTextContent(es.contact.error);
    expect(screen.getByRole('status')).toHaveTextContent('facumozo98@gmail.com');
    expect(screen.getByLabelText(es.contact.name_label)).toHaveValue('Ada');
  });
});
