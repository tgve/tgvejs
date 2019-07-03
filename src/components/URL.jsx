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
      onKeyPress={(event) => {
          if (event.which === 13 /* Enter */) {
            event.preventDefault();
          }
      }}
      className="search-form"
      onChange={(e) => {
        if(e.keyCode === 13) e.preventDefault()
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