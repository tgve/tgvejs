import React from 'react';
import { render } from '@testing-library/react';

import Hexplot from '../components/decksidebar/HexPlot'
import { sample20CasualtiesGeojson } from './utils';

test('Shallow and mount', () => {
  render(<Hexplot data={
    sample20CasualtiesGeojson.features
  }/>);
  // screen.debug()

})
