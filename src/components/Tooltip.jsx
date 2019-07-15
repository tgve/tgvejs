import React from 'react';
import { XYPlot, LineSeries, VerticalBarSeries, XAxis, YAxis, } from 'react-vis';

const WIDTH = 300;
const BAR_HEIGHT = 100;

export default class Tooltip extends React.Component {
    constructor(props) {
      super();
      this.state = {
        isMobile: props.isMobile,
      };
    }

    componentWillMount() {
        window.addEventListener('resize', this._handleWindowSizeChange.bind(this));
    }

    // make sure to remove the listener
    // when the component is not mounted anymore
    componentWillUnmount() {
        window.removeEventListener('resize', this._handleWindowSizeChange.bind(this));
    }

    _handleWindowSizeChange = () => {
        this.forceUpdate()
    };

    render() {
        const { topx, topy, hoveredObject } = this.props;
        const { isMobile } = this.state;
        // console.log(x,y);

        if (!hoveredObject) return null;

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
                if (parseInt(key)) { // TODO: replace with moment check - is it year?
                    crashes_data.push({ x: key, y: map.get(key) })
                } else {
                    severity_data.push({ x: key, y: map.get(key) })
                }
            })
        }        
        const w = window.innerWidth;
        const y = window.innerHeight;
        const n_topy = isMobile ? 10 : 
        topy + (WIDTH + BAR_HEIGHT) > y ? topy - WIDTH : topy;
        const n_left = isMobile ? 10 :
        topx + WIDTH > w ? topx - WIDTH : topx;
        const firstPointProperties = hoveredObject.points &&
        hoveredObject.points[0].properties && hoveredObject.points[0].properties;        
        const tooltip = 
            <div
                className="xyz" style={{
                    top: crashes_data.length > 1 ? n_topy : topy,
                    left: crashes_data.length > 1 ? n_left : topx
                }}>
                <div>
                    <b>Total:{type_feature ? 1 : hoveredObject.points.length}</b>
                </div>
                <div>
                    {
                    hoveredObject.properties && hoveredObject.properties.speed_limit ||
                    ( firstPointProperties && firstPointProperties.hasOwnProperty("speed_limit")) ? <div>
                        Road speed: {type_feature ? 
                        hoveredObject.properties.speed_limit :
                        firstPointProperties.speed_limit}
                    </div> : 
                    hoveredObject.properties ? Object.values(hoveredObject.properties)[0] : 
                    Object.values(firstPointProperties)[0]
                    }
                    {
                        // react-vis cannot generate plot for single value
                        crashes_data.length > 1 &&
                        <XYPlot
                            animation={{ duration: 0.8 }}
                            height={WIDTH} width={WIDTH}>
                            <XAxis
                                tickLabelAngle={-45}
                                tickFormat={v => v + ""}
                                style={{
                                    text: { fill: '#fff', fontWeight: 400 }
                                }} />
                            <YAxis
                                style={{
                                    text: { fill: '#fff', fontWeight: 400 }
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
                            height={BAR_HEIGHT} width={WIDTH} >
                            <XAxis
                                tickLabelAngle={-45}
                                tickFormat={v => v + ""}
                                style={{
                                    text: { fill: '#fff', fontWeight: 400 }
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