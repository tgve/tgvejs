import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import Uploader from '../components/File'
import DataInput from '../components/DataInput'
const textCSV = `
  Month,Reported by,Falls within,Longitude,Latitude
  2020-12,Avon and Somerset Constabulary,Avon and Somerset Constabulary,-3.496102,54.714537
  2020-12,Avon and Somerset Constabulary,Avon and Somerset Constabulary,-1.358494,53.069349
  Avon and Somerset Constabulary,Avon and Somerset Constabulary,-1.124136,51.28163
  `
const file = new File([textCSV], "dummy.csv", { type: "text/plain" })

test('Shallow and mount - File', async () => {
  const callback = jest.fn()
  const { container } = render(<Uploader
    contentCallback={callback} />);

  const uploader = container.querySelector('input')
  await fireEvent.change(uploader, {
    target: { files: [file] }
  })
  // console.log(uploader.files[0]);
  // https://github.com/testing-library/react-testing-library/issues/93#issuecomment-631511472
  expect(uploader.files[0]).toStrictEqual(file)

})

test('Shallow and mount - DataInput', async () => {
  await render(<DataInput />);
  fireEvent.click(
    await screen.findByText(/add data/i)
  )
  // screen.debug()

  const uploader = await screen.queryByText(/browse files/i)
  // looks like RTL does not like these sort of tests
  /**
   * <div>        <-- parent of closest
   *   <div>      <-- closest div
   *     <button> <-- uploader
   *   </div>
   *   <input />  <-- hidden children[1]
   * </div>
   */
  const input = uploader
  .parentNode.closest("div").parentNode.children[1]
  await fireEvent.change(input, {
    target: { files: [file] }
  })
  expect(input.files[0]).toStrictEqual(file)

})
