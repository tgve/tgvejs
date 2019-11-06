import React, { useState } from 'react';

import { makeWidthFlexible, Treemap } from 'react-vis';
const FlexibleTreemap = makeWidthFlexible(Treemap); 

const H = 250;
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
  const { data, plotStyle, title } = props;
  
  const treeProps = {
    animation: {
      damping: 9,
      stiffness: 300
    },
    data,
    onLeafMouseOver: x => setHoveredNode({ hoveredNode: x }),
    onLeafMouseOut: () => setHoveredNode({ hoveredNode: false }),
    // onLeafClick: () => this.setState({ treemapData: _getRandomData() }),
    mode: 'squarify',
    getLabel: x => x.name,
    // see 
    // https://github.com/uber/react-vis/issues/262#issuecomment-281757385
    width: plotStyle && plotStyle.width || H + 50,
    height: plotStyle && plotStyle.height || H
  };

  if(!data || data.length === 0) return null;
  return (
    <div className="dynamic-treemap-example">
      <h6>{title}</h6>
      {<FlexibleTreemap {...treeProps} />}
        {hoveredNode && hoveredNode.value}
    </div>
  )
}