import React from 'react';
import { StatefulPopover } from 'baseui/popover';
import { StyledLink } from "baseui/link";
import { Block } from 'baseui/block';

import { iWithFaName } from '../../utils';
import Preview from './Preview';

export default function Export(props) {
  const { notEmpty, screenshot } = props;

  return (
    notEmpty ?
      <StatefulPopover
        dismissOnEsc={false}
        dismissOnClickOutside={false}
        accessibilityType={'tooltip'}
        content={({ close }) => (
          <Block padding="10px" data-html2canvas-ignore="true">
            {iWithFaName("fa fa-times", close)}
            <Preview screenshot={screenshot} />
            {notEmpty && downloadButton(props.data)}
          </Block>
        )}
      >
        {
          iWithFaName("fa fa-share-alt-square", undefined)
        }
      </StatefulPopover> : <Preview screenshot={screenshot} />
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
  return (<StyledLink
    download={name || "tgve-data.geojson"}
    href={
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify({
        type: 'FeatureCollection',
        features: data
      }))
    }>
    {<i
      style={{
        margin: 5,
        cursor: 'pointer',
        fontSize: '1.5em',
      }}
      className={"fa fa-download"}></i>}
  </StyledLink>)
}