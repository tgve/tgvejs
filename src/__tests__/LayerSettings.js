import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import LayerSettings from '../components/settings/LayerSettings'
import { sample20CasualtiesGeojson as geojson } from './utils';

test('LayerSettings renders empty', () => {
  render(<LayerSettings />);
})

test('LayerSettings renders geojson settings', async () => {
  const {container} = render(<LayerSettings
    columnNames={
      Object.keys(geojson.features[0].properties)
    }
    layerName="geojson" />);

  expect(await screen.findByText(/geojson/i))
    .toBeInTheDocument()

  fireEvent.click(
    container.querySelector("svg")
  )
})

test('LayerSettings renders grid settings', async () => {
  const {container} = render(<LayerSettings
    columnNames={
      Object.keys(geojson.features[0].properties)
    }
    layerName='grid' />);

  expect(await screen.findByText(/grid/i))
    .toBeInTheDocument()

  fireEvent.click(
    container.querySelector('svg')
  )
})
