import React from 'react';

export default class Tooltip extends React.Component {

    render() {
        const {topx, topy, hoveredObject} = this.props;
        // console.log(x,y);
        
        if(!hoveredObject) return null;

        const type_feature = hoveredObject.type && hoveredObject.type === 'Feature';
        let list;
    
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
                return (
                    <li key={key} style={{
                        color: key.toLowerCase() === 'fatal' ? 'red' : 'white'
                    }}>
                        {key} : {map.get(key)}
                    </li>
                )
            })
        }
    
        const w = window.innerWidth;
        const tooltip =
            <div
                className="xyz" style={{ top: topy, left: topx + 100 > w ? topx - 100 : topx }}>
                <div>
                    <b>Accidents({type_feature ? 1 : hoveredObject.points.length})</b>
                </div>
                <div>
                    <div>
                        Speed: {type_feature ? hoveredObject.properties.speed_limit : hoveredObject.points[0].properties.speed_limit}
                    </div>
                    {!type_feature &&
                        <ul style={{ paddingLeft: 10 }}>
                            {
                                list
                            }
                        </ul>}
                </div>
            </div>
        return (tooltip)
    }
}