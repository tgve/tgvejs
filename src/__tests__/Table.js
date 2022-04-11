import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import Table from '../components/Table'
import {
  sample20CasualtiesGeojson as geojson
} from './utils';

test('Table renders empty', () => {
  //header not tested in npm
  render(<Table />);

  expect(screen
    .queryByText(/datetime/i))
    .not.toBeInTheDocument()
})

test('Table renders with data', async () => {
  //header not tested in npm
  render(<Table data={geojson.features} />);

  expect(screen
    .queryByText(/datetime/i))
    .toBeInTheDocument()

  //next button
  fireEvent.click((await screen
    .findAllByRole('button'))[0]
  )
  //prev button
  fireEvent.click((await screen
    .findAllByRole('button'))[1]
  )
})
