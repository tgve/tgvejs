import * as React from 'react';
import { Card } from 'baseui/card';
import { Spinner } from "baseui/spinner";
import { Checkbox } from "baseui/checkbox";

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
} from 'baseui/modal';

import { iWithFaName, screenshot } from '../../utils/utils';

export default function Preview(props) {
  const [isOpen, setOpen] = React.useState(false);
  const [image, setImage] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [noSidebar, setNoSidebar] = React.useState(false);

  const { map, deck } = props;

  React.useEffect(() => {
    if (!isOpen) return
    setLoading(o => !o)
    screenshot(map, deck, !noSidebar, (canvas) => {
      const url = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      setImage(url);
      setLoading(o => !o)
    })
  }, [isOpen, noSidebar])

  return (
    <React.Fragment>
      {iWithFaName("fa fa-save", () =>
        setOpen(o => !o), {}, "Save")}
      <Modal
        isOpen={isOpen}>
        <ModalHeader data-html2canvas-ignore="true">
          {loading ? <Spinner /> : "Screenshot Preview"}
        </ModalHeader>
        <ModalBody data-html2canvas-ignore="true">
          <Card
            overrides={{ Root: { style: { width: '100%' } } }}
            headerImage={image}
          />
        </ModalBody>
        <ModalFooter data-html2canvas-ignore="true">
          <Checkbox
            data-html2canvas-ignore="true"
            checked={noSidebar}
            onChange={e => setNoSidebar(e.target.checked)}
          >
            No sidebar
          </Checkbox>
          {modalButtonWithCallback("Download", () => {
            const link = document.createElement('a');
            const fileName = "tgve-screenshot.png";
            link.download = fileName;
            link.href = image;
            link.click();
          })}
          {modalButtonWithCallback("Close", () => setOpen(false))}
        </ModalFooter>
      </Modal>
    </React.Fragment >
  );
}

const modalButtonWithCallback = (title, onClick) => {
  return <ModalButton
    data-html2canvas-ignore="true"
    kind="tertiary"
    onClick={onClick}>{title}</ModalButton>
}
