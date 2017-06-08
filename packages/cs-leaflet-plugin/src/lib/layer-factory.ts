import { LeafletException } from './leaflet-exception';

export default class LayerFactory {

  constructor() {}

  getLayer(layer) {
    if (!layer.hasOwnProperty('type')) {
      layer.type = 'tile';
    }

    let instance;

    switch (layer.type) {
      case 'marker':
        instance = this.getMarker(layer);
        break;
      case 'popup':
        instance = this.getPopup(layer);
        break;
      case 'tile':
        instance = this.getTile(layer);
        break;
      case 'wms':
        instance = this.getWMS(layer);
        break;
      case 'canvas':
        instance = this.getCanvas(layer);
        break;
      case 'imageOverlay':
        instance = this.getImageOverlay(layer);
        break;
      case 'polyline':
        instance = this.getPolyline(layer);
        break;
      case 'multiPolyline':
        instance = this.getMultiPolyline(layer);
        break;
      case 'polygone':
        instance = this.getPolygone(layer);
        break;
      case 'multiPolygone':
        instance = this.getMultiPolygone(layer);
        break;
      case 'rectangle':
        instance = this.getRectangle(layer);
        break;
      case 'circle':
        instance = this.getCircle(layer);
        break;
      case 'circleMarker':
        instance = this.getCircleMarker(layer);
        break;
      case 'group':
        instance = this.getLayerGroup(layer);
        break;
      case 'featureGroup':
        instance = this.getFeatureGroup(layer);
        break;
      case 'geoJSON':
        instance = this.getGeoJson(layer);
        break;
      default:
        throw new LeafletException(`Layer type ${layer.type} not implemented`);
    }

    if (typeof layer.initCallback === 'function') {
      layer.initCallback(instance);
    }

    if (layer.hasOwnProperty('events')) {
      for (let e of layer.events) {
        if (typeof instance.on === 'function') {
          instance.on(e.name, e.callback);
        }
      }
    }

    return instance;
  }

  getMarker(layer) {
    if (!layer.hasOwnProperty('latLng')) {
      throw new LeafletException('No latLng given for layer.type "marker"');
    }
    let marker = L.marker(layer.latLng, layer.options);
    if (layer.hasOwnProperty('popupContent')) {
      marker.bindPopup(layer.popupContent).openPopup();
    }
    return marker;
  }

  getPopup(layer) {
    let popup = L.popup(layer.options);
    if (layer.hasOwnProperty('content')) {
      popup.setContent(layer.content);
    }
    if (layer.hasOwnProperty('latLng')) {
      popup.setLatLng(layer.latLng);
    }
    return popup;
  }

  getTile(layer) {
    if (!layer.hasOwnProperty('url')) {
      throw new LeafletException('No url given for layer.type "tile"');
    }
    return L.tileLayer(layer.url, layer.options);
  }

  getWMS(layer) {
    if (!layer.hasOwnProperty('url')) {
      throw new LeafletException('No url given for layer.type "wms"');
    }
    return L.tileLayer.wms(layer.url, layer.options);
  }

  getCanvas(layer) {
    // let l = L.canvas(layer.options);
    // if (layer.hasOwnProperty('drawTile')) {
    //   l.drawTile = layer.drawTile;
    // }
    // if (layer.hasOwnProperty('tileDrawn')) {
    //   l.tileDrawn = layer.tileDrawn;
    // }
    // return l;
  }

  getImageOverlay(layer) {
    if (!layer.hasOwnProperty('url')) {
      throw new LeafletException('No url given for layer.type "imageOverlay"');
    }
    if (!layer.hasOwnProperty('imageBounds')) {
      throw new LeafletException('No imageBounds given for layer.type "imageOverlay"');
    }
    return L.imageOverlay(layer.url, layer.imageBounds, layer.options);
  }

  getPolyline(layer) {
    if (!layer.hasOwnProperty('latLngs')) {
      throw new LeafletException('No latLngs given for layer.type "polyline"');
    }
    return L.polyline(layer.latlngs, layer.options);
  }

  getMultiPolyline(layer) {
    if (!layer.hasOwnProperty('latLngs')) {
      throw new LeafletException('No latLngs given for layer.type "multiPolyline"');
    }
    return L.polyline(layer.latlngs, layer.options);
  }

  getPolygone(layer) {
    if (!layer.hasOwnProperty('latLngs')) {
      throw new LeafletException('No latLngs given for layer.type "polygone"');
    }
    return L.polygon(layer.latlngs, layer.options);
  }

  getMultiPolygone(layer) {
    if (!layer.hasOwnProperty('latLngs')) {
      throw new LeafletException('No latLngs given for layer.type "multiPolygone"');
    }
    return L.polygon(layer.latlngs, layer.options);
  }

  getRectangle(layer) {
    if (!layer.hasOwnProperty('bounds')) {
      throw new LeafletException('No bounds given for layer.type "rectangle"');
    }
    return L.rectangle(layer.bounds, layer.options);
  }

  getCircle(layer) {
    if (!layer.hasOwnProperty('latLng')) {
      throw new LeafletException('No latLng given for layer.type "circle"');
    }
    if (!layer.hasOwnProperty('radius')) {
      throw new LeafletException('No radius given for layer.type "circle"');
    }
    return L.circle(layer.latLng, layer.radius, layer.options);
  }

  getCircleMarker(layer) {
    if (!layer.hasOwnProperty('latLng')) {
      throw new LeafletException('No latLng given for layer.type "circleMarker"');
    }
    return L.circleMarker(layer.latLng, layer.options);
  }

  getLayerGroup(layer) {
    if (!layer.hasOwnProperty('layers')) {
      throw new LeafletException('No layers given for layer.type "group"');
    }
    let layers = [];
    for (let l of layer.layers) {
      layers.push(this.getLayer(l));
    }
    return L.layerGroup(layers);
  }

  getFeatureGroup(layer) {
    if (!layer.hasOwnProperty('layers')) {
      throw new LeafletException('No layers given for layer.type "featureGroup"');
    }
    let layers = [];
    for (let l of layer.layers) {
      layers.push(this.getLayer(l));
    }
    return L.featureGroup(layers);
  }

  getGeoJson(layer) {
    if (!layer.hasOwnProperty('data')) {
      throw new LeafletException('No data property given for layer.type "geoJSON"');
    }
    return L.geoJSON(layer.data, layer.options);
  }
}