import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import Export from '../components/export/Export';

test('Shallow and mount', async () => {
  const { container, rerender } = render(<Export />);
  fireEvent.click(
    container.querySelector('i')
  )
  expect(await screen
    .findByText(/download/i))
    .toBeInTheDocument()

  rerender(<Export notEmpty={true} />)
  fireEvent.click(
    await screen.findByRole('button')
  )
  screen.debug()

})
