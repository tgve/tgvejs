import React, { useState } from 'react';
import {
  InputGroup, FormControl,
  Glyphicon, FormGroup
} from 'react-bootstrap';

import { isURL } from '../utils';

export default function URL(props) {
  const { urlCallback } = props;
  const [url, setUrl] = useState("https://domain.com/api/stats19")

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
          style={{
            background: props.dark ? '#242730' : 'white',
            color: props.dark ? 'white' : 'black'
          }}
          value={url}
          placeholder={url} type="text" />
          <InputGroup.Addon
          style={{
            background: props.dark ? '#242730' : 'white',
            color: props.dark ? 'white' : 'black'
          }}>
            <Glyphicon 
            glyph="globe" />
          </InputGroup.Addon>
        </InputGroup>
      </FormGroup>
    </form>
  )
}