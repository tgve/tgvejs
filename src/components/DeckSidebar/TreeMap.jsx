import React, { useState } from 'react';

import { Treemap } from 'react-vis';

/**
 * props.data needs to be in this formard
 * {
 *    title: 'sometitle',
 *    color: 1,
 *    children: [1,2,3,4].map(e => ({
 *      name: e,
 *      size: Math.random() * 500,
 *      color: Math.random(),
 *      style: {
 *        border: 'thin solid red'
 *      }
 *     }
 *   ))
 * }
 * 
 * @param {Object} props react props
 */
export default function TreeMap(props) {
  const [hoveredNode, setHoveredNode] = useState(false)
  const { data } = props;
  
  const treeProps = {
    animation: {
      damping: 9,
      stiffness: 300
    },
    data,
    onLeafMouseOver: x => setHoveredNode({ hoveredNode: x }),
    onLeafMouseOut: () => setHoveredNode({ hoveredNode: false }),
    // onLeafClick: () => this.setState({ treemapData: _getRandomData() }),
    height: 300,
    mode: 'squarify',
    getLabel: x => x.name,
    width: 350
  };

  if(!data || data.length === 0) return null;
  return (
    <div className="dynamic-treemap-example">
      {<Treemap {...treeProps} />}
        {hoveredNode && hoveredNode.value}
    </div>
  )
}