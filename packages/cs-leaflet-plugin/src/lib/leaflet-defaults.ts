import { MapOptions, LatLng } from "leaflet";
import { IMapLayer } from "./definitions";

export const defaultMapOptions: MapOptions = {
  center: <LatLng> {
    lat: 51.452761,
    lng: 5.507586
  },
  zoom: 13
};

export const defaultLayers: IMapLayer = {
  base: [
    {
      id: 'OSM Tiles',
      type: 'tile',
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      options: {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }
    }
  ],
  overlay: []
};