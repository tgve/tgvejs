import React from 'react';
import { render, screen } from '@testing-library/react';

import Boxplot from '../components/boxplot/Boxplot'
import {
  sample20CasualtiesGeojson as geojson
} from './utils';
import { getPropertyValues } from '../utils/geojsonutils';

test('Shallow and mount', async () => {
  render(<Boxplot data={
    getPropertyValues(geojson, "accident_severity")
  }/>);
  expect(await screen.queryByText(/slight/i))
    .not.toBeInTheDocument()

  render(<Boxplot data={
    getPropertyValues(geojson, "speed_limit")
  }/>);
  expect(await screen.findByText(/20/i)).toBeInTheDocument()
})
