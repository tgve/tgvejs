import React from 'react';
import { render, screen } from '@testing-library/react';

import URL from '../components/URL'

test('Shallow and mount', () => {
  render(<URL />);

  expect(screen
    .queryByPlaceholderText(/file.csv/i))
    .not.toBeNull()
  expect(screen
    .queryByText("🔗"))
    .not.toBeNull()
})
