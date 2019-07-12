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
            isURL(url) && typeof (urlCallback) === 'function' &&
              urlCallback(url)
          }
      }}
      className="search-form">
      <FormGroup>
        <InputGroup>
          <FormControl
          onChange={(e) => {            
            const { value } = e.target;
            setUrl(value)
            // console.log(isURL(value))
          }} 
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