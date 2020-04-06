import {CompositeLayer} from "@deck.gl/core";
import {IconLayer} from "@deck.gl/layers";
import Supercluster from "supercluster";

function getIconName(pct) {
  if (pct === 0) {
    return "";
  }
  return `marker-${pct}`;
}

function getIconSize(size) {
  return Math.min(100, size) / 100 + 1;
}

function getClusterTotalForCurrentFilter(clusterItems, filter) {
  console.log(clusterItems, filter);
  let total = 0;

  clusterItems.forEach(item => {
    total += parseInt(item.properties.properties[filter]);
  });

  return total;
}

export default class IconClusterLayer extends CompositeLayer {
  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, changeFlags}) {
    const rebuildIndex =
      props.filter !== oldProps.filter || changeFlags.dataChanged || props.sizeScale !== oldProps.sizeScale;

    if (rebuildIndex) {
      const index = new Supercluster({maxZoom: 16, radius: props.sizeScale});
      index.load(
        props.data.map(d => ({
          geometry: {coordinates: props.getPosition(d)},
          properties: d
        }))
      );
      this.setState({index});
    }

    const z = Math.floor(this.context.viewport.zoom);
    if (rebuildIndex || z !== this.state.z) {
      this.setState({
        data: this.state.index.getClusters([-180, -85, 180, 85], z),
        z
      });
    }
  }

  getPickingInfo({info, mode}) {
    const pickedObject = info.object && info.object.properties;
    if (pickedObject) {
      if (pickedObject.cluster && mode !== "hover") {
        info.objects = this.state.index.getLeaves(pickedObject.cluster_id, 25).map(f => f.properties);
      }
      info.object = pickedObject;
    }
    return info;
  }

  renderLayers() {
    const {data} = this.state;
    const {iconAtlas, iconMapping, sizeScale, filter} = this.props;

    return new IconLayer(
      this.getSubLayerProps({
        id: "icon",
        data,
        iconAtlas,
        iconMapping,
        sizeScale,
        getPosition: d => d.geometry.coordinates,
        getIcon: d => {
          let value = 0;
          // console.log("Get icon", filter);

          if (d.properties.cluster) {
            const clusterItems = this.state.index.getLeaves(d.properties.cluster_id);
            value = getClusterTotalForCurrentFilter(clusterItems, filter);
          } else {
            value = parseInt(d.properties.properties[filter]);
          }

          return getIconName(value);
        },
        getSize: d => getIconSize(d.properties.cluster ? d.properties.point_count : 1)
      })
    );
  }
}
