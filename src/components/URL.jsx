import React, { useState } from 'react';
import {
  InputGroup, FormControl,
  Glyphicon, FormGroup
} from 'react-bootstrap';

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
          <FormControl placeholder="localhost:8000/api/stats19" type="text" />
          <InputGroup.Addon>
            <Glyphicon glyph="globe" />
          </InputGroup.Addon>
        </InputGroup>
      </FormGroup>
    </form>
  )
}

/**
 * Thanks to https://stackoverflow.com/a/34695026/2332101
 * @param {*} str 
 */
function isURL(str) {
  var a = document.createElement('a');
  a.href = str;
  return (a.host && a.host != window.location.host);
}
