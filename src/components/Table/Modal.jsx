import * as React from 'react';
import {Button, KIND, SIZE } from 'baseui/button';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'baseui/modal';

import DataTable from './Table';

export default (props) => {
  const [isOpen, setIsOpen] = React.useState(false);
  function close() {
    setIsOpen(false);
  }
  return (
    <React.Fragment>
      <i 
      style={{cursor: 'pointer', fontSize:'1.5em'}}
      onClick={() => setIsOpen(true)}
      className="fa fa-table"></i>
      <Modal size="80%" onClose={close} isOpen={isOpen}>
        <ModalHeader>Data table</ModalHeader>
        <ModalBody>
          <DataTable data={props.data}/>
        </ModalBody>
        <ModalFooter>
          <Button 
            kind={KIND.secondary} size={SIZE.compact}
            onClick={close}>Okay</Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};