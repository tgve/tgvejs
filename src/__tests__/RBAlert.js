import React from 'react';
import { render, screen, waitFor } from '@testing-library/react'
import { within } from '@testing-library/dom'

import RBAlert from '../components/RBAlert'

test('Shallow and mount', async () => {
  // needs alert object to render
  render(<RBAlert alert={{ content: "message" }} />);
  await waitFor(() => screen.getByRole('alert'))
  expect(within(screen.getByRole("alert")).findByText("message"))
  // expect(screen.find(Notification).prop('kind')).toEqual("warning");
  // console.log(screen.getByRole("alert"));

})
