import React from 'react';
import { styled } from 'baseui';

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

export {
  headerComponent
}
