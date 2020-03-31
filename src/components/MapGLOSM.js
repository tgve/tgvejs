import React, {Component} from "react";
import ReactMapGL from "react-map-gl";

export default class MapGLOSM extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: 37.7577,
        longitude: -122.4376,
        zoom: 8
      },
      window: {
        width: 0,
        height: 0
      }
    };

    this.setWindowDimensions = this.setWindowDimensions.bind(this);
  }

  componentDidMount() {
    this.setWindowDimensions();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.setWindowDimensions);
    }
  }

  componentDidUnmount() {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.setWindowDimensions);
    }
  }

  setWindowDimensions() {
    if (typeof window !== "undefined") {
      this.setState({
        window: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      });
    }
  }

  render() {
    return (
      <div>
        <ReactMapGL
          height={this.state.window.height + "px"}
          width={this.state.window.width + "px"}
          mapStyle={{
            version: 8,
            name: "OSM",
            metadata: {},
            sources: {
              openmaptiles: {
                type: "vector",
                url: "https://free.tilehosting.com/data/v3.json?key={key}"
              },
              osm: {
                type: "raster",
                tiles: ["http://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                minzoom: 0,
                maxzoom: 14
              },
              "91y5159eg": {
                type: "vector",
                url: "http://localhost:3000/tilejson.json"
              }
            },
            sprite: "https://openmaptiles.github.io/klokantech-basic-gl-style/sprite",
            glyphs: "https://free.tilehosting.com/fonts/{fontstack}/{range}.pbf?key=undefined",
            layers: [
              {
                id: "osm",
                type: "raster",
                source: "osm"
              }
            ],
            id: "klokantech-basic"
          }}
          {...this.state.viewport}
          onViewportChange={viewport => this.setState({viewport})}
        />
      </div>
    );
  }
}
