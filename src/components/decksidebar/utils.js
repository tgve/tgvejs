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

export {
  searchNominatom,
  headerComponent
}
