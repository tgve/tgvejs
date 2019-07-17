import React, { useState, useEffect } from 'react';
import { sfType } from '../geojsonutils';

export default function GeomExplore(props) {
  const [data, setData] = useState(props.data)
  // console.log(data[1]);
  useEffect(() => {
      setData(props.data);
  }, [props.data])
  const geom = data[0].geometry && data[0].geometry.coordinates.join(' - ');
  return (
    <div style={{ color: 'white' }}>
      First row is: {' '} {sfType(data[0])}
      <p style={{wordBreak: 'break-all'}}>
        {geom.length > 50 ? geom.substring(0, 50) + " ... " + geom.length + " characters long." : geom}
      </p>
    </div>
  )
}