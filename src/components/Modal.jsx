import * as React from 'react';
import { Button, KIND, SIZE } from 'baseui/button';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'baseui/modal';

export default (props) => {
  const [open, setOpen] = React.useState(false);
  const { toggleOpen, title, component, button } = props;

  return (
    <React.Fragment>
      <i
        style={{
          margin: 5,
          cursor: 'pointer',
          fontSize: '1.5em'
        }}
        onClick={() => {
          typeof toggleOpen === 'function' && toggleOpen();
          setOpen(true);
        }}
        className={button || "fa fa-table"}></i>
      <Modal size="80%"
        onClose={() => {
          typeof (toggleOpen) === 'function' && toggleOpen()
          setOpen(false);
        }} isOpen={open}>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          {component}
        </ModalBody>
        <ModalFooter>
          <Button
            kind={KIND.secondary} size={SIZE.compact}
            onClick={() => {
              setOpen(false);
              typeof (toggleOpen) === 'function' && toggleOpen();
            }}>Okay</Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};