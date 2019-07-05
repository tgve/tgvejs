import React, { useState, useEffect } from 'react';
import { sfType } from '../geojsonutils';

export default function GeomExplore(props) {
  const [data, setData] = useState(props.data)
  console.log(data[1]);
  useEffect(() => {
      setData(props.data);
  }, [props.data])
  return (
    <div style={{ color: 'white' }}>
      First row is: {' '} {sfType(data[0])}
      <p>{data[0].geometry && data[0].geometry.coordinates.join(' - ')}</p>
    </div>
  )
}