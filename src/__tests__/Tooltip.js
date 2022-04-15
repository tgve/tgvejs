import React from 'react';
import { render, screen } from '@testing-library/react';

import Tooltip from '../components/tooltip'
import { sampleGeojson } from './utils';

test('Shallow and mount', async () => {
  render(<Tooltip
    //simulate DeckGL selectedObject
    selectedObject={{
      type: "Feature",
      properties: sampleGeojson.features[0].properties
    }}
  />);
  expect(await screen
    .findByText(/prop0/i))
    .toBeInTheDocument()
})
