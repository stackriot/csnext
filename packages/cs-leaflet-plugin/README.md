# A leaflet plugin for the csnext framework

This is a plugin for [Aurelia](http://aurelia.io/) providing a CustomElement `<csnext-leaflet></csnext-leaflet>` that displays a map.

It is a clone of [Benib's Aurelia Leaflet](https://github.com/benib/aurelia-leaflet) custom element, but converted to Typescript and updated.

## Getting started
See the root's [README](../../README.md).

## Installation

To use it in your own Aurelia project, first use `yarn` or `npm` to install the component (currently, you can only link against the folder, e.g. `yarn link @csnext/cs-leaflet-plugin`
You also need to install leaflet
```console
yarn add leaflet
```
or
```console
npm i leaflet -S
```
Add the plugin to `main.ts`. This is also the place to import the leaflet.css file (either from the locally installed leaflet folder, or from CDN). For example:

```ts
import 'aurelia-bootstrapper';
import { Aurelia } from 'aurelia-framework';
import 'fuse-box-aurelia-loader';
import 'https://cdn.jsdelivr.net/leaflet/1.0.3/leaflet.css';
import './styles/styles.css';

declare var FuseBox: any;

export async function configure(aurelia: Aurelia) {
    aurelia.use
        .standardConfiguration()
        .plugin('@csnext/cs-leaflet-plugin');

    if (FuseBox.import('process').env.devMode) {
        aurelia.use.developmentLogging();
    }
    await aurelia.start();
    await aurelia.setRoot('app');
}
```

You want to make sure the map container div gets a height like this:
```css
  .leaflet-container {
    height: 500px;
  }
```

## Usage

From there on you can use the CustomElement `<csnext-leaflet>` like this:

```html
  <csnext-leaflet></csnext-leaflet>
```
This is the most basic usage and gives you a map of Eindhoven at zoom 13 with the OpenStreetMap tiles from openstreetmap.org. This is probably not what you want, so here are the options you got:

```html
  <csnext-leaflet
    map-options.bind="mapOptions"
    layers.bind="layers"
    map-events.bind="leafletMapEvents"
    with-layer-control.bind="withLayerControl"
    with-scale-control.bind="withScaleControl"
  >
  </csnext-leaflet>
```

### attributes of the leaflet CustomElement explained

#### map-options
Bind this to a [MapOptions](http://leafletjs.com/reference.html#map-options) object. They will get merged with the default options:
```js
{
  center: {
    lat: 47.3686498,
    lng: 8.53918250,
  },
  zoom: 13
}
```
So if you don't want a map centered at Eindhoven, provide at least another center. If you change `center`, `zoom`, or `maxBounds` after the map is loaded, the map will get changed, other property changes are not yet implemented. Open an issue or submit a PR if you need something else.

#### layers
Layers is an object with information about the layers you want on your map. Whenever you change it, the layers available on your map will change. Removed ones will get removed, new ones will get added. Have a look at the default layers object:
```js
{
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
}
```
Alright, this gives you a one baseLayer with tiles from openstreetmap.org. Note that the layers are divided in base and overlay layers. Every Layer needs to have an `id` property. This `id` is used as the key in the LayersControl, if you add one. If not given, it is set to the `url`. If no `url` is given (some layers don't have one), an exception is thrown.

Note that there is a `type` property. `"tile"` is the default value and could be omitted. The other types available are: `marker`, `popup`, `wms`, `canvas`, `imageOverlay`, `polyline`, `multiPolyline`, `polygone`, `multiPolygon`, `rectangle`, `circle`, `circleMarker`, `layerGroup`, `featureGroup` and `geoJSON`. If you know Leaflet, you see that these are all the Layers available in Leaflet. They are documented [here](http://leafletjs.com/reference.html). The options property of your layer config will get passed to the respective constructor for the given layer type.

For more information on what to you need to configure either read the leaflet docs for these layers and guess what you need to configure, or read `src/lib/layer-factory.ts`.

#### map-events
Bind this to an array like `['click', 'load']`. The array should consist of any of the map-events documented [here](http://leafletjs.com/reference.html#map-events). Listeners for these will get added to the `map` object and will publish an event using aurelias `EventAggregator` in the `aurelia-leaflet` channel.

To listen to them, you want to import and inject the `EventAggregator` like this:
```ts
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class App {

  constructor(EventAggregator) {
    this.eventAggregator = EventAggregator;

    this.eventAggregator.subscribe('aurelia-leaflet', (payload) => {
      console.log(payload);
    });
  }
}
```
The payload you receive will be the event from Leaflet with one additional property `map` that is the instance of `Leaflet.map`.

#### with-layer-control
If this is `false` or not set there will be no layer control. Otherwise the value of this property will get passed as the options parameter to `L.control.layers` as documented [here](http://leafletjs.com/reference.html#control-layers).

#### with-scale-control
If this is `false` or not set there will be no scale control. Otherwise the value of this property will get passed as the options parameter to `L.control.scale` as documented [here](http://leafletjs.com/reference.html#control-scale).

### How to get access to the map object
Read the information about `map-events`. Make sure you register the `load` event, subscribe to the channel `aurelia-leaflet` in aurelias `EventAggregator` and get a payload with a property `map` that is the map object after leaflet fires to `load` event (after first time center and zoom are set).
