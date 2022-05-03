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

import File from './File'
import URL from './URL';
import RBAlert from './RBAlert';

/**
 * The csv2geojson package is by mapbox.
 *
 * GDAL specs have been taken into consideration according to
 * package docs. The package creats lines and polygons from
 * correct csv files.
 *
 * There has been good effort into guessing the naming of
 * lat/longs, see
 * https://github.com/mapbox/csv2geojson/blob/gh-pages/index.js
 *
 * From the package
 * var latRegex = /(Lat)(itude)?/gi,
 *  lonRegex = /(L)(on|ng)(gitude)?/i;
 *
 */
const csv2geojson = require('csv2geojson');

export default function (props) {
  const [isOpen, setOpen] = React.useState(false);
  const [alert, setAlert] = React.useState(false);

  const { urlCallback, toggleOpen } = props;

  return (
    <React.Fragment>
      <Button
        kind={KIND.secondary} size={SIZE.compact}
        onClick={() => {
          toggleSelfAndParent(toggleOpen, setOpen);
        }}>Add data</Button>
      <Modal
        onClose={() => {
          toggleSelfAndParent(toggleOpen, setOpen);
        }}
        isOpen={isOpen}>
        <ModalHeader>
          <RBAlert alert={alert} />
          Your data remains on your browser. It is NOT uploaded anywhere.
        </ModalHeader>
        <ModalBody>
          <FocusOnce>
            <URL urlCallback={(url) => {
              toggleSelfAndParent(toggleOpen, setOpen);
              typeof (urlCallback) === 'function'
                && urlCallback(url)
            }} />
          </FocusOnce>
          TGVE Accepts GeoJSON, CSV and Shapefiles (zip)
          <File contentCallback={({ text, geojson, name }) => {
            if (name && (name.match(/geo|json/) //test.json
              || name.match(/zip/))) {
              try {
                const json = name.match(/zip/) ? geojson : JSON.parse(text);
                typeof (urlCallback) === 'function'
                  && urlCallback(null, json, name)
                  toggleSelfAndParent(toggleOpen, setOpen);
              } catch (e) {
                console.log(e);
              }
            } else {
              // err has any parsing errors
              csv2geojson.csv2geojson(text, (err, data) => {
                if (!err) {
                  toggleSelfAndParent(toggleOpen, setOpen);
                  typeof (urlCallback) === 'function'
                    && urlCallback(null, data, name)
                } else {
                  // console.log(err);
                  /** err == array with feature errors? */
                  const message = Array.isArray(err)
                    && err[0] && err[0].message;
                  setAlert({
                    time: 5000,
                    content: "Invalid format. "
                    + (message ?  "ERROR: " + message : "")
                  })
                }
              });
            }
          }} />
        </ModalBody>
        <ModalFooter>
          <ModalButton onClick={() => {
            setOpen(false);
            typeof (toggleOpen) === 'function' && toggleOpen();
          }}>Close</ModalButton>
        </ModalFooter>
      </Modal>
    </React.Fragment >
  );
}

function toggleSelfAndParent(toggleOpen, setOpen) {
  typeof (toggleOpen) === 'function' && toggleOpen();
  setOpen(o => !o);
}
