import * as React from 'react';
import {
  Card,
  StyledBody,
  StyledAction,
} from 'baseui/card';
import { Button } from 'baseui/button';
export default (props) => {
  if (!props) {
    return null;
  }
  return (
    <Card
      // overrides={{ Root: { style: { width: props.width || '128px' } } }}
      headerImage={props.image}
      title={props.title}
    >
      <StyledBody>
        {props.body}
      </StyledBody>
      <StyledAction>
        <Button
          onClick={() => typeof props.loadCallback === 'function' &&
            props.loadCallback()}
          overrides={{ BaseButton: { style: { width: '100%' } } }}>
          {props.button}
        </Button>
      </StyledAction>
    </Card>
  );
}