/**
 * Add features from geojson from a URL to a given map.
 *
 *
 * If the features are points and there are >10 features or circle=true then
 * features are displayed as circleMarkers, else Markers.
 *
 * @param fetchURL default = 'http://localhost:8000/api/data'
 * @param radius default 8
 *
 * geoplumber R package React code.
 */
import React from 'react';
import { GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { interpolatePlasma } from 'd3-scale-chromatic';
// import { min, max} from 'd3-array';

import RBSlider from './RBSlider'
export default class ScenariosComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            geojson: null,
            year: 2020
        }
        this._fetchData = this._fetchData.bind(this)
        this._generateLegend = this._generateLegend.bind(this);
    }

    _fetchData(url, callback) {
        // console.log("fetching... " + url)
        fetch(url)
            .then((response) => {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                    return;
                }
                // Examine the text in the response
                response.json()
                    .then((geojson) => {
                        if ((geojson.features && geojson.features.length === 0) || response.status === 'ZERO_RESULTS') {
                            this.setState({ error: response.status })
                        } else {
                            if (geojson.features) {
                                var geojsonLayer = L.geoJson(geojson)
                                const bbox = geojsonLayer.getBounds()
                                // assuming parent has provided "map" object
                                this.props.map && this.props.map.fitBounds(bbox)
                            }
                            callback(geojson)
                        }
                    });
            })
            .catch((err) => {
                console.log('Fetch Error: ', err);
            });
    }

    _generateLegend(year) {
        function sortNumber(a, b) {
            return a - b;
        }
        var legend = L.control({ position: 'topright' });
        legend.onAdd = () => {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = year.map(each => parseFloat(each.JOBS)).sort(sortNumber),
                labels = [];
            const jMax = grades[grades.length - 1], jMin = grades[0];
                                   
            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < 1; i+=0.1) {
                div.innerHTML +=
                    '<i style="background:' + interpolatePlasma(i) + '"></i> ';
                if(i === 0) div.innerHTML += jMin.toFixed(2)
                if(i - 0.9 >= Number.EPSILON)div.innerHTML += jMax.toFixed(2)
                div.innerHTML += '<br/>';
            }
            div.innerHTML += "Jobs"
            return div;
        };
        legend.addTo(this.props.map);
        this.setState({legend})
    }
    
    componentDidMount() {
        const geom = 'http://localhost:8000/api/geom'
        const json = 'http://localhost:8000/api/scenarios'
        this._fetchData(geom, (geojson) => this.setState({ geojson }))
        this._fetchData(json, (scenarios) => {
            const year1 = scenarios.filter(each => each.YEAR === this.state.year)
            let jobsSum = 0
            year1.forEach((each) => jobsSum += parseFloat(each.JOBS))
            this._generateLegend(year1, jobsSum)
            this.setState({
                allScenarios: scenarios, 
                scenarios: year1, 
                jobsSum,
             })
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.fetchURL !== prevProps.fetchURL) {
            this._fetchData()
        }
        if (this.props.radius !== prevProps.radius) {
            this.forceUpdate()
        }
    }

    render() {
        const { geojson, scenarios, year,
            allScenarios } = this.state;
        let { style } = this.props;
        if (!geojson || !scenarios) {
            return (null) // as per React docs
        }

        if (!geojson.features || geojson.type !== "FeatureCollection") {
            if (geojson.coordinates) { //single feature.
                return (
                    <GeoJSON //react-leaflet component
                        style={style}
                        data={geojson}
                    />
                )
            } else {
                return (null) //nothing is passed to me.
            }
        }
        // we have type: "FeatureCollection"
        return (
            <div>
                <RBSlider
                    min={2020}
                    max={2050}
                    step="1"
                    position="bottomleft"
                    onChange={(year) =>{
                        //each.YEAR is integer!
                        const aYear = allScenarios.filter(each => each.YEAR === parseInt(year))
                        let jobsSum = 0
                        aYear.forEach((each) => jobsSum += parseFloat(each.JOBS))                        
                        this.state.legend.remove();
                        this._generateLegend(aYear, jobsSum)
                        this.setState({
                            scenarios: aYear, 
                            jobsSum, 
                            year: year
                        })
                    }} 
                />
                {
                    geojson.features.map((feature, i) => {
                        const record = scenarios.filter(each => each.CODE === feature.properties['LAD13CD'])
                        return (
                            <GeoJSON //react-leaflet component
                                key={feature.properties['LAD13CD'] + year}
                                style={{
                                    fillColor: interpolatePlasma(10 * record[0].JOBS / this.state.jobsSum),
                                    weight: 2,
                                    opacity: 1,
                                    color: 'red',
                                    dashArray: '3',
                                    fillOpacity: 0.7
                                }}
                                data={feature}
                                onEachFeature={(feature, layer) => {
                                    const record = scenarios.filter(each => each.CODE === feature.properties['LAD13CD'])
                                    const properties = Object.keys(record[0]).map((key) => {
                                        return (key + " : " + record[0][key])
                                    })
                                    layer.bindPopup(
                                        properties.join('<br/>')
                                    );
                                }}
                                pointToLayer={
                                    // use cricles prop if not 10 markers is enough
                                    this.props.circle || geojson.features.length > 8 ?
                                        (_, latlng) => {
                                            // Change the values of these options to change the symbol's appearance
                                            let options = {
                                                radius: record[0].GVA / 50,
                                                fillColor: "green",
                                                color: "black",
                                                weight: 15,
                                                opacity: 1,
                                                fillOpacity: 0.8
                                            }
                                            return L.circleMarker(latlng, options);
                                        }
                                        :
                                        (_, latlng) => {
                                            return L.marker(latlng);
                                        }
                                }
                            />
                        )
                    })
                }
            </div>
            
        )
    }
}
