import React, { useState } from 'react';
import { Input } from 'baseui/input';
import { FormControl } from 'baseui/form-control';

import { searchNominatom } from '../../utils/utils';

export default function SearchForm (props) {
  const [search, setSearch] = useState();
  const { onlocationChange } = props;
  return(
    <form className="search-form" onSubmit={(e) => {
      e.preventDefault();
      searchNominatom(search, (json) => {
        let bbox = json && json.length > 0 && json[0].boundingbox;
        bbox = bbox && bbox.map(num => +(num))
        typeof onlocationChange === 'function' && bbox &&
          onlocationChange({
            bbox: bbox,
            lon: +(json[0].lon), lat: +(json[0].lat)
          })
      })
    }}>
      <FormControl >
        <Input
          id="search-nominatum"
          placeholder="fly to ..."
          value={search}
          onChange={({ target: { value } }) => setSearch(value)}
          endEnhancer="🌐"
        />
      </FormControl>
    </form>
  )
}
