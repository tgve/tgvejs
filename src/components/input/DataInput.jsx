import * as React from 'react';
import { Button, KIND, SIZE } from 'baseui/button';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
} from 'baseui/modal';
import { Input } from 'baseui/input';

import File from './File'
import RBAlert from '../RBAlert';

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
  const [dataFile, setDataFile] = React.useState(null);
  const [geoColumn, setGeoColumn] = React.useState(null);

  const { urlCallback, toggleOpen } = props;

  const cleanAlert = (alert) => {
    setAlert(null)
    setAlert(alert)
  }

  function toggleSelfAndParent() {
    setAlert(null)
    setOpen(o => !o);
    typeof (toggleOpen) === 'function' && toggleOpen();
  }

  /**
   *
   * @param {Object} param is expected to have
   *  `textOrBuffer`, `name`, and `type` everytime
   * a file is read by File component.
   *
   * @returns
   */
  const _contentCallback = ({
    textOrBuffer, name, type }) => {
    if (typeof (urlCallback) !== 'function')
      return;
    /**
     * The function deals with four possiblities:
     * 1. File is read and contains geometry
     * 2. File is read and does not contain geometry
     *  asks user for geometry
     * 3. Second file is read and contains geometry
     * 4. Second file is read and still does not contain
     *  geometry
     *
     * @param {Object} json geojson object
     * @param {Object} geography geojson object
     */
    const callBackAndClose = (json, geography) => {
      let noGeoCount = 0, file = json;
      if (geography) {
        file = geography
      }
      file.features
        && file.features.forEach(e => {
          if (!e.geometry)
            noGeoCount += 1;
        });
      // do not proceed if no geography
      if (noGeoCount === file.features.length) {
        !dataFile && setDataFile({ json, name, type });
        cleanAlert({
          time: 5000,
          content: !geography ?
            "File has no geography. File saved as data file, "
            + "add a geography file or remove & upload."
            : "Geography file has no geography."
        });
      } else {
        // when we call back we make sure
        // dataGeojson is not null
        urlCallback(null,
          json || dataFile.json,
          name, geography, geoColumn);
        // clear dataFile
        setDataFile(null)
        toggleSelfAndParent();
      }
    };

    if (dataFile) {
      // dataFile is processed, process geography
      processTextOrBuffer(
        type, textOrBuffer, (geographyGeojson) => {
          // both ready now
          // do not combine them yet
          // this happens in home/generatelayer
          callBackAndClose(null, geographyGeojson);
        }
      );
    } else {
      processTextOrBuffer(type, textOrBuffer, (json) => {
        callBackAndClose(json);
      });
    }
  };
  return (
    <React.Fragment>
      <Button
        kind={KIND.secondary} size={SIZE.compact}
        onClick={() => {
          toggleSelfAndParent();
        }}>Add data</Button>
      <Modal
        onClose={() => {
          toggleSelfAndParent();
        }}
        isOpen={isOpen}>
        <ModalHeader>
          <RBAlert alert={alert} />
          Your data remains on your browser. It is NOT uploaded anywhere.
        </ModalHeader>
        <ModalBody>
          <p>You can add remote data using the URL API.
            Like tgve.github.com/app?defaultURL=https://domain.com/data.geojson
          </p>
          {dataFile ? <p>Now add the geography</p> :
            <p>
              You can add separate data & geography files.
              First read a CSV file, then add the geography file (shap or geojson).
            </p>}
          {/**
           * The approach is to do all processing here and
           * processing but leave File component only to read
           * the file.
           */}
          <File contentCallback={_contentCallback} />
          {
            dataFile &&
            <>
              <p>Data file:
                {(dataFile && ` ${dataFile.name} , waiting for geography file. `)
                  || " none"}
                {dataFile
                  && <i onClick={() => {
                    setDataFile(null)
                    setAlert(null)
                  }}
                    style={{ fontSize: '2rem' }}
                    className="fa fa-trash" />}
              </p>
              <p>Type the geography column name or map data file
                column name to geography like `geo:geography`
              </p>
              <Input
                placeholder='geo:geography'
                onChange={
                  (e) => setGeoColumn(e.target.value)
                } />
            </>
          }
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
        cleanAlert({
          time: 5000,
          content: "No shp in context or corrupt shapefile zip"
        })
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
          cleanAlert({
            time: 5000,
            content: "Invalid format. "
              + (message ? "ERROR: " + message : "")
          });
        }
      });
    }
  }
}
