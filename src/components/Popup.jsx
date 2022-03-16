import React from 'react';
import { Table } from 'baseui/table';
import { humanize } from '../utils/utils';
import { getPropertyValues, propertyCountByProperty } from '../utils/geojsonutils';
import Plot from './showcases/GenericPlotly';
import { scaleSequential } from 'd3-scale';
import { TURQUOISE_RANGE } from '../Constants';

const WIDTH = 220;
const BAR_HEIGHT = 80;

export default class Popup extends React.Component {
  constructor(props) {
    super();
    this._listPropsAndValues = this._listPropsAndValues.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this._handleWindowSizeChange.bind(this));
  }

  // make sure to remove the listener
  // when the component is not mounted anymore
  componentWillUnmount() {
    window.removeEventListener('resize', this._handleWindowSizeChange.bind(this));
  }

  _handleWindowSizeChange () {
    this.forceUpdate()
  };

  /**
   * clickedObject can be of two types so far:
   * 1. collections of points with `.points` property
   * 2. properties of `.type === 'Feature'`.
   */
  render() {
    console.log("in popup's render()")
    const popup =
      <div
        className="xyz" style={{
          top: (WIDTH + BAR_HEIGHT),
          left: WIDTH 
        }}>
        <div>
          <h3>Hello world</h3>
        </div>
      
      </div >
    return (popup)
  }

  _listPropsAndValues(clickedObject, all = false, n = 6) {
    if(!clickedObject.properties ||
      (clickedObject.points && (!clickedObject.points ||
       !clickedObject.points[0].properties))) return null

    let DATA = []
    const props = clickedObject.properties;
    if (props) {
      const keys = Object.keys(props)
      DATA = keys
        .slice(0, all ? keys.length : n)
        .map(p => {
          return ([humanize(p), props[p]])
        })
    } else { // two points passed go through first one
      const keys = Object.keys(clickedObject.points[0].properties);
      DATA = keys
        .slice(0, all ? keys.length : n) // miss accident_index
        .map(p => {
          let points = [
            humanize(p),
            clickedObject.points[0].properties[p],
          ]
          if (clickedObject.points[1]) {
            points.push(clickedObject.points[1].properties[p])
          }
          return (points)
        })
    }
    return <Table style={{ maxWidth: '320px' }}
      columns={
        clickedObject.points &&
          clickedObject.points.length === 2 ?
          ['Property', 'Value p1', 'Value p2'] : ['Property', 'Value']
      } data={DATA} />

  }
}
