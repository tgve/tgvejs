import React from 'react';
import { render, screen } from '@testing-library/react';

import DeckSidebar from '../components/decksidebar/DeckSidebar'
import Charts from '../components/decksidebar/Charts';
import { sampleGeojson } from './utils';

test('Shallow and mount - DeckSidebar', async () => {
  render(<DeckSidebar />);

  expect((await screen
    .findByText(/nothing/i))
    .textContent)
    .toBe('Nothing to show')

})

test('Shallow and mount - Charts', () => {
  // see sampleGeojson for 'prop1'
  const { container } = render(
    <Charts
      data={sampleGeojson.features}
      column={'prop0'}/>
  );
  // screen.debug()
  expect(container
    .querySelector("svg"))
    .toBeInTheDocument()

  expect(container
    .querySelector("rect"))
    .toBeInTheDocument()
})
