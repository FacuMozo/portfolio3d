import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { ROUTER_FUTURE } from '../routes'

/** Renders with the same providers as main.jsx (language) plus an in-memory router. */
export const renderWithProviders = (ui, { route = '/' } = {}) =>
  render(
    <LanguageProvider>
      <MemoryRouter initialEntries={[route]} future={ROUTER_FUTURE}>{ui}</MemoryRouter>
    </LanguageProvider>,
  );
