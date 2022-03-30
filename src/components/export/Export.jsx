import React, { useState } from 'react';
import { StatefulPopover } from 'baseui/popover';
import { StyledLink } from "baseui/link";
import { Block } from 'baseui/block';
import { Notification, KIND } from "baseui/notification";

import { iWithFaName } from '../../utils/utils';
import Preview from './Preview';
import { isString } from '../../utils/JSUtils';

export default function Export(props) {
  const [notification, setNotification] = useState(false)
  const { notEmpty, map, deck } = props;

  return (
    notEmpty ?
      <StatefulPopover
        placement="top"
        dismissOnEsc={false}
        dismissOnClickOutside={true}
        accessibilityType={'tooltip'}
        content={({ close }) => (
          <Block padding="5px"
            data-html2canvas-ignore="true">
            {iWithFaName("fa fa-times", close)}
            <Preview map={map} deck={deck} />
            {notEmpty && downloadButton(props.data)}
            {iWithFaName("fa fa-copy", () => {
              window.location &&
                copyTextToClipboard(window.location.href,
                  (success) => {
                    if (success) {
                      setNotification("Link copied to clipboard")
                      // did not expect this to work
                      close()
                    } else {
                      // setNotification("Could not write to clipboard")
                      window.prompt("Copy to clipboard: Ctrl+C, Enter",
                      window.location.href)
                    }
                  });
            })}
          </Block>
        )}
      >
        <i>
          {iWithFaName("fa fa-share-alt-square", undefined)}
          {
            notification &&
            <Notification
              overrides={{
                Body: { style: { width: 'auto' } },
              }}
              kind={KIND.positive}
              autoHideDuration={3000}
              onClose={() => setNotification(false)}
            >
              {() => notification}
            </Notification>
          }
        </i>
      </StatefulPopover> : <Preview map={map} deck={deck} />
  )
}

/**
 * Generates a `data:text/json` URI and assigned
 * to a `href` attribute of the dom therefore
 * opened by browsers as a file.
 *
 * @param {*} data feature array to be assembled as GeoJSON
 * @param {*} name optional filename
 * @returns
 */
const downloadButton = (data, name) => {
  const anchorID = 'tgve-span-download'
  return (<span
    onClick={ () => {
      const dataStr = "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify({
        type: 'FeatureCollection',
        features: data
      }))
      const e = document.getElementById(anchorID);
      e.setAttribute("href", dataStr);
      e.setAttribute("download", name || "tgve-data.geojson");
      e.click();
    }}>
      <a id={anchorID} style={{display:"none"}}></a>
    {<i
      style={{
        margin: 5,
        cursor: 'pointer',
        fontSize: '1.5em',
      }}
      className={"fa fa-download"}></i>}
  </span>)
}

/**
 * It is important to have good coverage as discussed
 * in the relevant SO answer with credit to community.
 * Fallback is ignored as document.execCommand("copy")
 * is deprecated.
 *
 * https://stackoverflow.com/a/30810322
 *
 * @param {*} text
 * @returns
 */
const copyTextToClipboard = (text, callback) => {
  if (!isString(text)) return
  if (!navigator.clipboard) {
    // fallbackCopyTextToClipboard(text, callback);
    typeof callback === 'function' && callback(false)
    return;
  }
  navigator.clipboard.writeText(text).then(function () {
    typeof callback === 'function' && callback(true)
    // console.log('Async: Copying to clipboard was successful!');
  }, function (err) {
    typeof callback === 'function' && callback(false)
    // console.error('Async: Could not copy text: ', err);
  });
}
