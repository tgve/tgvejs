import React from 'react';
import { styled } from 'baseui';
import { fetchData } from '../../utils/utils';

const headerComponent = (content) => {
  const HDiv = styled("div", ({ $theme }) => ({
    backgroundColor: $theme.colors.backgroundTertiary,
    padding: '10px', borderRadius: '5px',
    marginBottom: '20px'
  }))
  return (
    <HDiv>
      {content}
    </HDiv>)
}

const searchNominatom = (location, callback) => {
  const url = "https://nominatim.openstreetmap.org/search/" +
    location + "?format=json";
  fetchData(url, (json) => {
    typeof callback === 'function' && callback(json)
  })
}

const getMessage = (array) => {
  return array && array.length &&
    array.length + " row" + (array.length > 1 ? "s" : "")
}
const getMainMessage = (filtered, unfiltered) => {
  if (filtered && filtered.length && unfiltered && unfiltered.length) {
    return getMessage(filtered) + (filtered.length < unfiltered.length ?
      " of " + unfiltered.length : "")
  } else if (filtered && filtered.length) {
    return getMessage(filtered)
    // TODO: check all rows before declaring
  }
  else {
    return "Nothing to show"
  }
}

export {
  searchNominatom,
  headerComponent,
  getMainMessage
}
