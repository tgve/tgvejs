import React from 'react';
import {XYPlot, LineSeries, VerticalBarSeries, XAxis, YAxis, } from 'react-vis';
const WIDTH = 300;
const BAR_HEIGHT = 100;

export default class Tooltip extends React.Component {

    render() {
        const {topx, topy, hoveredObject} = this.props;
        // console.log(x,y);
        
        if(!hoveredObject) return null;

        const type_feature = hoveredObject.type && hoveredObject.type === 'Feature';
        let list;
        let crashes_data = [];
        let severity_data = [];

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
            Array.from(map.keys()).forEach(key => {
                // console.log(key, [ ...map.keys() ]);
                if(parseInt(key)) { // is it year?
                    crashes_data.push({x: key, y: map.get(key)})
                } else {
                    severity_data.push({x: key, y: map.get(key)})
                }
            })
        }
        
        const w = window.innerWidth;
        const y = window.innerHeight
        const tooltip =
            <div
                className="xyz" style={{ 
                    top: crashes_data.length > 1 && 
                    topy + WIDTH > y ? topy - WIDTH : topy, 
                    left: crashes_data.length > 1 && 
                    topx + WIDTH > w ? topx - WIDTH : topx }}>
                <div>
                    <b>Total:{type_feature ? 1 : hoveredObject.points.length}</b>
                </div>
                <div>
                    <div>
                        Road speed: {type_feature ? hoveredObject.properties.speed_limit : hoveredObject.points[0].properties.speed_limit}
                    </div>
                    {
                        // react-vis cannot generate plot for single value
                        crashes_data.length > 1 &&
                        <XYPlot 
                        animation={{duration: 0.8}}
                        height={WIDTH} width={WIDTH}>
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
                                title="Crashes" />
                            <LineSeries 
                            
                            data={crashes_data} />
                        </XYPlot>
                    }
                                        {
                        // react-vis cannot generate plot for single value
                        severity_data.length > 1 &&
                        <XYPlot 
                        xType="ordinal" 
                            width={WIDTH} height={BAR_HEIGHT}>
                            <XAxis 
                                tickLabelAngle={-45}
                                tickFormat={v => v + ""}
                                style={{
                                    text: { fill: '#fff', fontWeight: 600 }
                                }} />
                            <VerticalBarSeries
                            // color={v => v === "Fatal" ? 1 : v === "Slight" ? 0 : null}
                            data={severity_data} />
                        </XYPlot>
                    }
                </div>
            </div>
        return (tooltip)
    }
}