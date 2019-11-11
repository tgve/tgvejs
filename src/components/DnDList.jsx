import * as React from "react";
import {
  List,
  arrayMove,
  arrayRemove
} from "baseui/dnd-list";

export default (props) => {
  const [items, setItems] = React.useState(props.list || []);
  if (!Array.isArray(props.list) || items.length === 0) return null;
  return (
    <List
      items={items}
      onChange={({ oldIndex, newIndex }) =>
        setItems(
          newIndex === -1
            ? arrayRemove(items, oldIndex)
            : arrayMove(items, oldIndex, newIndex)
        )
      }
    />
  );
}