import * as React from "react";
import { Notification, KIND } from "baseui/notification";

/**
 * baseweb notification does not rerender
 * with changing React key. Best action is to
 * clear any notification with timer or
 * resetting before creating a new one.
 * See DataInput for example of this React
 * approach.
 *
 */
export default (props = {}) => {
  const alert = props.alert
  if(!alert) return null

  return (
    <Notification
      overrides={{
        Body: {
          style: () => ({
            width: '100%',
          }),
        }
      }}
      kind={(alert && alert.kind)
        || KIND.warning}
      autoHideDuration={
        alert && +alert.time || 3000}>
      {alert.content}
    </Notification>
  );
}
