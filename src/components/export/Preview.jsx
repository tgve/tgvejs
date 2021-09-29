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
import { iWithFaName } from '../../utils';

export default function Preview(props) {
  const [isOpen, setOpen] = React.useState(false);
  const [image, setImage] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [noSidebar, setNoSidebar] = React.useState(false);

  const { screenshot } = props;

  React.useEffect(() => {
    if (!isOpen) return
    setLoading(o => !o)
    typeof screenshot === 'function'
      && screenshot(!noSidebar, (canvas) => {
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
        setOpen(o => !o))}
      <Modal
        isOpen={isOpen}>
        <ModalHeader>
          {loading ? <Spinner /> : "Screenshot Preview"}
        </ModalHeader>
        <ModalBody>
          <Card
            overrides={{ Root: { style: { width: '100%' } } }}
            headerImage={image}
          />
        </ModalBody>
        <ModalFooter>
          <Checkbox
            checked={noSidebar}
            onChange={e => setNoSidebar(e.target.checked)}
          >
            No sidebar
          </Checkbox>
          <ModalButton
            kind="tertiary"
            autoFocus onClick={() => {
              const link = document.createElement('a');
              const fileName = "tgve-screenshot.png";
              link.download = fileName;
              link.href = image;
              link.click();
            }}> Download </ModalButton>
          <ModalButton
            kind="tertiary"
            onClick={() => {
              setOpen(false);
            }}>Close</ModalButton>
        </ModalFooter>
      </Modal>
    </React.Fragment >
  );
}