import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

test('renders without crashing', () => {
  render(<App />);
});

// in dark theme these are the classes
// assigned to the parent div
// ae af ag ah
// in lighttheme:
// dg af ag ah
test('App defaults to dark theme when given no prop', async () => {
  render(<App />);
  expect(await screen
    .getByText(/nothing/i).closest('div'))
    .toHaveClass('ae af ag ah')
});

test('App can be set to light theme via props', async () => {
  render(<App dark={false} />);
  expect(await screen
    .getByText(/nothing/i).closest('div'))
    .toHaveClass('dg af ag ah')
});

test('App snapshot dark theme', () => {
  const { asFragment } = render(<App />);
  expect(asFragment()).toMatchSnapshot();
});

test('App snapshot light theme', () => {
  const { asFragment } = render(<App dark={false} />);
  expect(asFragment()).toMatchSnapshot();
});

test("Test empty state", () => {
  render(<App dark={false} />);
  expect(screen.getByText('Nothing to show')).toBeInTheDocument();
});

test('App - API params via ENV', async () => {
  const { rerender } = render(<App />)
  expect(await screen
    .queryByRole("heading", { level: 2 }))
    .toBeInTheDocument()

  process.env.REACT_APP_HIDE_SIDEBAR = true

  rerender(<App />);
  expect(await screen
    .queryByRole("heading", { level: 2 }))
    .toBeNull()
  expect(await screen
    .queryByRole("heading", { level: 6 }))
    .toBeNull()

  process.env.REACT_APP_DARK = false
  process.env.REACT_APP_HIDE_SIDEBAR = false
  rerender(<App />);
  expect(await screen
    .getByText(/nothing/i).closest('div'))
    .toHaveClass('dg af ag ah')
})
