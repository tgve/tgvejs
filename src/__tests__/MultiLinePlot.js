import React from 'react';
import { render, screen } from '@testing-library/react';

import MultiLinePlot from '../components/showcases/MultiLinePlot'
import { humanize, xyObjectByProperty } from '../utils/utils';
import { sample20CasualtiesGeojson as geojson } from './utils';

test('MultiLinePlot empty', () => {
  render(<MultiLinePlot />);

})

test('MultiLinePlot with data', async () => {
  const col = "day_of_week"
  const data = xyObjectByProperty(
    geojson.features, col
  )
  render(<MultiLinePlot data={[data]} title={humanize(col)}/>);

  expect(await screen
    .findByText(/day of week/i))
    .toBeInTheDocument()

})
