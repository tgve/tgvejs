import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import Variables from '../components/Variables';
import { sampleGeojson } from './utils';
import { keySetObject } from '../utils/api';

test('Variables - renders empty', async () => {
  render(<Variables />);
  expect(await screen
    .queryByText(/filter/i))
    .not.toBeInTheDocument()
})

test('Variables - renders with data', async () => {
  render(
    <Variables
      multiVarSelect={
        keySetObject('prop0:value0')
      }
      unfilteredData={sampleGeojson.features}
    />
  );
  expect(await screen
    .queryByText(/filter/i))
    .toBeInTheDocument()

  expect(await screen
    .queryByText(/Prop0 \[String\]/i))
    .toBeInTheDocument()

  fireEvent.click((await screen
    .findAllByText(/clear all/i))[0]
    .closest('svg'))
})
