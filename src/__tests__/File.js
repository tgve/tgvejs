import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import Uploader from '../components/File'

test('Shallow and mount', async () => {
  const file = new File(["one,two,three"], "dummy.csv", {type: "text/plain"})
  const { container } = render(<Uploader />);

  const uploader = container.querySelector('input')
  await fireEvent.change(uploader, {
    target: {files: [file]}
  })
  // screen.debug(uploader)
  // console.log(uploader.files[0]);
  https://github.com/testing-library/react-testing-library/issues/93#issuecomment-631511472
  expect(uploader.files[0]).toStrictEqual(file)

})
