import * as React from 'react';
import { Button, KIND, SIZE } from 'baseui/button';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
  FocusOnce,
} from 'baseui/modal';

import URL from './URL';

export default function (props) {
  const [isOpen, setOpen] = React.useState(false);
  const { urlCallback } = props;
  return (
    <React.Fragment>
      <Button
        kind={KIND.secondary} size={SIZE.compact}
        onClick={() => setOpen(s => !s)}>Add data</Button>
      <Modal
        onClose={() => {
          typeof (props.onClose) === 'function' && props.onClose()
          console.log(props.onClose);

          setOpen(false)
        }
        }
        isOpen={isOpen}>
          <ModalHeader>Add Data</ModalHeader>
        <ModalBody>
          <FocusOnce>
            <URL urlCallback={(url) => {
                setOpen(false)
                typeof (urlCallback) === 'function'
                  && urlCallback(url)
              }} />
          </FocusOnce>
        </ModalBody>
        <ModalFooter>
          <ModalButton onClick={() => setOpen(false)}>Close</ModalButton>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
}