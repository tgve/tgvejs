
import * as React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'
import ColorPicker from '../components/ColourPicker'

test('shows ColorPicker renders', () => {
  const handleClick = jest.fn()
  const { container } = render(
    <ColorPicker colourCallback={handleClick}/>)
  const colorDivs = container.getElementsByClassName('color-box')
  expect(screen.queryByText("Color:")).not.toBeNull()
  expect(colorDivs.length).toBe(6);

  fireEvent.click(colorDivs[0])
  expect(handleClick).toHaveBeenCalledTimes(1)
  // screen.debug()
  // console.log(container)
})
