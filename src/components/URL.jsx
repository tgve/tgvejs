import React, { useState } from 'react';
import {
  InputGroup, FormControl,
  Glyphicon, FormGroup
} from 'react-bootstrap';

import {isURL} from '../utils';

export default function URL(props) {
  const { urlCallback } = props;
  const [url, setUrl] = useState("/api/stats19")

  return (
    <form
      className="search-form"
      onChange={(e) => {
        const { value } = e.target;
        setUrl(value)
        // console.log(isURL(value))
        isURL(value) && typeof (urlCallback) === 'function' &&
          urlCallback(value)
      }}>
      <FormGroup>
        <InputGroup>
          <FormControl 
          value={url}
          placeholder={url} type="text" />
          <InputGroup.Addon>
            <Glyphicon glyph="globe" />
          </InputGroup.Addon>
        </InputGroup>
      </FormGroup>
    </form>
  )
}