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
import { setGeojsonProps } from '../utils/utils';

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
          {/**
           * The approach is to do all processing here and
           * in future a separate function to handle file content
           * processing but leave File component only to read
           * the file.
           */}
          <File contentCallback={({
            separateGeo, dataTextOrBuffer, geoTextOrBuffer,
            geoColumn, textOrBuffer, name, type }) => {
            if (typeof (urlCallback) !== 'function') return
            const callBackAndClose = (json, dataName, geography) => {
              urlCallback(null, json, dataName, geography, geoColumn)
              toggleSelfAndParent(toggleOpen, setOpen);
            }
            if (separateGeo) {
              // first process data
              processTextOrBuffer(
                dataTextOrBuffer.type, dataTextOrBuffer.textOrBuffer,
                (dataGeojson) => {
                  processTextOrBuffer(
                    geoTextOrBuffer.type, geoTextOrBuffer.textOrBuffer,
                    (geographyGeojson) => {
                      // both ready now
                      // do not combine them yet
                      // this happens in home/generatelayer
                      callBackAndClose(
                        dataGeojson, dataTextOrBuffer.name, geographyGeojson)
                    }
                  )
                }
              )
            } else {
              processTextOrBuffer(type, textOrBuffer, (json) => {
                callBackAndClose(json, name)
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

  function processTextOrBuffer(type, textOrBuffer, callback) {
    if (type.match(/json|geo/i)) {
      try {
        const json = JSON.parse(textOrBuffer);
        callback(json);
      } catch (e) {
        console.log(e);
      }
    } else if (type.match(/zip/)) {
      if (typeof shp === 'function') {
        shp(textOrBuffer)
          .then((json) => {
            callback(json);
          });
      } else {
        console.log("No shp in context or corrupt shapefile zip");
      }
    } else {
      // csv
      // err has any parsing errors
      csv2geojson.csv2geojson(textOrBuffer, (err, data) => {
        if (!err) {
          callback(data);
        } else {
          // console.log(err);
          /** err == array with feature errors? */
          const message = Array.isArray(err)
            && err[0] && err[0].message;
          setAlert({
            time: 5000,
            content: "Invalid format. "
              + (message ? "ERROR: " + message : "")
          });
        }
      });
    }
  }
}

function toggleSelfAndParent(toggleOpen, setOpen) {
  typeof (toggleOpen) === 'function' && toggleOpen();
  setOpen(o => !o);
}
