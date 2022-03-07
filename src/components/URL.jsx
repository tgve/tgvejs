import React, { useState } from 'react';
import { Input } from 'baseui/input';
import { FormControl } from 'baseui/form-control';

import { isURL } from '../utils/utils';

export default function URL(props) {
  const { urlCallback } = props;
  const [url, setUrl] = useState()

  return (
    <form className="search-form"
      onSubmit={(e) => {
        e.preventDefault();
        isURL(url) && typeof (urlCallback) === 'function' &&
          urlCallback(url)
      }}>
      <FormControl >
        <Input
          id="search-nominatum"
          placeholder={"https://domain.com/api/file.csv"}
          value={url}
          onChange={({ target: { value } }) => setUrl(value)}
          endEnhancer="🔗"
        />
      </FormControl>
    </form>
  )
}
