import React from 'react';
import {XYPlot, LineSeries, VerticalGridLines, 
HorizontalGridLines, XAxis, YAxis, } from 'react-vis';
export default class Tooltip extends React.Component {

    render() {
        const {topx, topy, hoveredObject} = this.props;
        // console.log(x,y);
        
        if(!hoveredObject) return null;

        const type_feature = hoveredObject.type && hoveredObject.type === 'Feature';
        let list;
        let data = [];

        if (!type_feature) {
            list = hoveredObject.points.map(feature => {                
                const aKey = {}
                if (feature.properties.hasOwnProperty('accident_severity')) {
                    aKey.severity = feature.properties.accident_severity;
                }
                if (feature.properties.hasOwnProperty('date')) {
                    aKey.year = feature.properties.date.split("/")[2];
                }                                
                return (aKey)
            });
            const map = new Map()
            //aggregate severity and years
            list.forEach(element => {
                if (element.hasOwnProperty('severity')) {
                    if (map.get(element.severity)) {
                        map.set(element.severity, map.get(element.severity) + 1)
                    } else {
                        map.set(element.severity, 1)
                    }
                }
                if (element.hasOwnProperty('year')) {
                    if (map.get(element.year)) {
                        map.set(element.year, map.get(element.year) + 1)
                    } else {
                        map.set(element.year, 1)
                    }
                }
            });
            // list severity and year counts
            list = Array.from(map.keys()).map(key => {
                // console.log(key, [ ...map.keys() ]);
                if(parseInt(key)) {
                    data.push({x: key, y: map.get(key)})
                }
                return (
                    <li key={key} style={{
                        color: key.toLowerCase() === 'fatal' ? 'red' : 'white'
                    }}>
                        {key} : {map.get(key)}
                    </li>
                )
            })
        }

        console.log(data);
        
        const w = window.innerWidth;
        const y = window.innerHeight
        const tooltip =
            <div
                className="xyz" style={{ 
                    top: topy + 300 > y ? topy - 300 : topy, 
                    left: topx + 300 > w ? topx - 300 : topx }}>
                <div>
                    <b>Accidents({type_feature ? 1 : hoveredObject.points.length})</b>
                </div>
                <div>
                    <div>
                        Speed: {type_feature ? hoveredObject.properties.speed_limit : hoveredObject.points[0].properties.speed_limit}
                    </div>
                    {
                        // react-vis cannot generate plot for single value
                        data.length > 1 &&
                        <XYPlot 
                        animation={{duration: 0.8}}
                        height={300} width={300}>
                            <XAxis 
                                tickLabelAngle={-45}
                                tickFormat={v => v + ""}
                                style={{
                                    text: { fill: '#fff', fontWeight: 600 }
                                }} />
                            <YAxis 
                                style={{
                                    text: { fill: '#fff', fontWeight: 600 }
                                }}
                                title="X Axis" />
                            <LineSeries data={data} />
                        </XYPlot>
                    }
                </div>
            </div>
        return (tooltip)
    }
}