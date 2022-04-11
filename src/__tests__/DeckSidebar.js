import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import DeckSidebar from '../components/decksidebar/DeckSidebar'
import Charts from '../components/decksidebar/Charts';
import { sampleGeojson } from './utils';

test('DeckSidebar with data', async () => {
  // do not use sample20CasualtiesGeojson
  // it will hit Plotly
  // for now cannot mock it
  render(<DeckSidebar data={sampleGeojson.features} />);

  expect(await screen
    .queryByText(/nothing/i))
    .not.toBeInTheDocument()

  // open settings tab
  fireEvent.click(
    (await screen.findAllByRole('tab'))[1]
  )

  // generate hexplot
  fireEvent.click(
    (await screen.findAllByRole('checkbox'))[0]
  )
})

test('DeckSidebar with no data', async () => {
  render(<DeckSidebar />);

  expect((await screen
    .findByText(/nothing/i))
    .textContent)
    .toBe('Nothing to show')

  // open add data
  fireEvent.click(
    await screen.findByText(/add data/i)
  )

  // close
  fireEvent.click(
    await screen.findByText(/close/i)
  )

})

test('Shallow and mount - Charts', () => {
  // see sampleGeojson for 'prop1'
  const { container } = render(
    <Charts
      data={sampleGeojson.features}
      column={'prop0'} />
  );
  // screen.debug()
  expect(container
    .querySelector("svg"))
    .toBeInTheDocument()

  expect(container
    .querySelector("rect"))
    .toBeInTheDocument()
})
