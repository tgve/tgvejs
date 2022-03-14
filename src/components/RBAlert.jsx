import * as React from "react";
import { Notification, KIND } from "baseui/notification";

export default (props) => {
  React.useEffect(() => {

  }, [props.alert])
  if(!props.alert) return null

  return (
    <Notification
    overrides={{
      Body: {
        style: () => ({
          width: '100%',
        }),
      }}}
      kind={props.alert.kind || KIND.warning}
      autoHideDuration={3000}>
      {() => props.alert.content}
    </Notification>
  );
}
