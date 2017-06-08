import { MapOptions } from 'leaflet';
import { customElement, bindable, inject, inlineView } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { LeafletException } from './leaflet-exception';
import { defaultMapOptions, defaultLayers } from './leaflet-defaults';
import LayerFactory from './layer-factory';
import { IMapLayer, ILayerDescription } from "./definitions";
import template from './leaflet.html';

@customElement('csnext-leaflet')
@inlineView(template)
@inject(EventAggregator, Element)
export class LeafletCustomElement {
  @bindable layers;
  @bindable mapEvents: L.Event[];
  @bindable mapOptions: MapOptions;
  @bindable withLayerControl;
  @bindable withScaleControl;

  private map: L.Map;
  private layerFactory: LayerFactory;
  private mapInit: Promise<object>;
  private mapInitResolve;
  private mapInitReject;
  private eventsBound;
  private eventsBoundResolve;
  private eventsBoundReject;
  private layerControl;
  private scaleControl;
  private mapContainer;

  attachedLayers = {
    base: {},
    overlay: {}
  };

  constructor(private eventAggregator: EventAggregator, private element: Element) {
    this.layerFactory = new LayerFactory();
    this.mapInit = new Promise((resolve, reject) => {
      this.mapInitResolve = resolve;
      this.mapInitReject = reject;
    });

    this.eventsBound = new Promise((resolve, reject) => {
      this.eventsBoundResolve = resolve;
      this.eventsBoundReject = reject;
    });

    this.mapOptions = defaultMapOptions;
    this.layers = defaultLayers;
    this.attachLayers();
  }

  layersChanged(newLayers: IMapLayer, oldLayers: IMapLayer) {
    if (oldLayers && oldLayers !== null) {
      this.removeOldLayers(oldLayers.base, 'base');
      this.removeOldLayers(oldLayers.overlay, 'overlay');
    }
    this.attachLayers();
  }

  mapOptionsChanged(newOptions, oldOptions) {
    this.mapOptions = Object.assign(defaultMapOptions, newOptions);

    // some options can get set on the map object after init
    this.mapInit.then(() => {
      if (oldOptions) {
        if (this.mapOptions.center !== oldOptions.center) {
          this.map.setView(this.mapOptions.center, this.mapOptions.zoom);
        }
        if (this.mapOptions.zoom !== oldOptions.zoom) {
          this.map.setZoom(this.mapOptions.zoom);
        }
        if (this.mapOptions.maxBounds !== oldOptions.maxBounds) {
          this.map.setMaxBounds(this.mapOptions.maxBounds);
        }
      }
    });
  }

  mapEventsChanged(newEvents, oldEvents) {
    this.mapInit.then(() => {
      if (newEvents && newEvents.length) {
        for (let eventName of newEvents) {
          this.map.on(eventName, e => this.eventAggregator.publish('aurelia-leaflet', Object.assign(e, { map: this.map })));
        }
      }
      if (oldEvents !== null) {
        for (let removedEvent of oldEvents.filter(e => newEvents.indexOf(e) === -1)) {
          this.map.off(removedEvent);
        }
      }
      if (!this.eventsBound.resolved) {
        this.eventsBoundResolve();
      }
    });
  }

  withLayerControlChanged(newValue) {
    if (newValue === false) {
      this.mapInit.then(() => {
        if (this.layerControl) {
          this.map.removeControl(this.layerControl);
        }
      });
    } else {
      this.mapInit.then(() => {
        if (this.layerControl) {
          this.map.removeControl(this.layerControl);
        }
        this.layerControl = L.control.layers(this.attachedLayers.base, this.attachedLayers.overlay, newValue).addTo(this.map);
      });
    }
  }

  withScaleControlChanged(newValue) {
    if (newValue === false) {
      this.mapInit.then(() => {
        if (this.scaleControl) {
          this.map.removeControl(this.scaleControl);
        }
      });
    } else {
      this.mapInit.then(() => {
        if (this.scaleControl) {
          this.map.removeControl(this.scaleControl);
        }
        this.scaleControl = L.control.scale(newValue).addTo(this.map);
      });
    }
  }

  attached() {
    return new Promise((resolve, reject) => {
      // remove the center option before contructing the map to have a chance to bind to the "load" event
      // first. The "load" event on the map gets fired after center and zoom are set for the first time.
      const center = this.mapOptions.center;
      delete this.mapOptions.center;
      if (!this.map) {
        this.map = L.map(this.mapContainer, this.mapOptions);
        this.map.on('load', () => {
          setTimeout(() => this.map.invalidateSize(), 400);
        });
      }
      this.mapOptions.center = center;

      if (this.map) {
        this.mapInitResolve();
      } else {
        this.mapInitReject();
        reject();
      }

      resolve();

      if (this.mapEvents) {
        this.eventsBound.then(() => {
          this.map.setView(this.mapOptions.center, this.mapOptions.zoom);
        });
      } else {
        this.map.setView(this.mapOptions.center, this.mapOptions.zoom);
      }
    });
  }

  attachLayers() {
    let layersToAttach = {
      base: {},
      overlay: {}
    };
    if (this.layers.hasOwnProperty('base')) {
      for (let layer of this.layers.base) {
        layersToAttach.base[this.getLayerId(layer)] = this.layerFactory.getLayer(layer);
      }
    }
    if (this.layers.hasOwnProperty('overlay')) {
      for (let layer of this.layers.overlay) {
        layersToAttach.overlay[this.getLayerId(layer)] = this.layerFactory.getLayer(layer);
      }
    }
    this.mapInit.then(() => {
      for (let layerId in layersToAttach.base) {
        this.attachedLayers.base[layerId] = layersToAttach.base[layerId].addTo(this.map);
      }
      for (let layerId in layersToAttach.overlay) {
        this.attachedLayers.overlay[layerId] = layersToAttach.overlay[layerId].addTo(this.map);
      }
    });
  }

  removeOldLayers(oldLayers: ILayerDescription[], type: string) {
    if (!oldLayers || !oldLayers.length) {
      return;
    }
    let removedLayers = oldLayers.filter((oldLayer) => {
      let removed = true;
      if (!this.layers.hasOwnProperty(type)) {
        return true;
      }
      for (let newLayer of this.layers[type]) {
        if (this.getLayerId(newLayer) === this.getLayerId(oldLayer)) {
          removed = false;
        }
      }
      return removed;
    });

    for (let removedLayer of removedLayers) {
      this.mapInit.then(() => {
        let id = this.getLayerId(removedLayer);
        if (this.attachedLayers[type].hasOwnProperty(id)) {
          this.map.removeLayer(this.attachedLayers[type][id]);
          delete this.attachedLayers[type][this.getLayerId(removedLayer)];
        }
      });
    }
  }

  getLayerId(layer) {
    let id = layer.id ? layer.id : layer.url;
    if (!id) {
      throw new LeafletException('Not possible to get id for layer. Set the id property');
    }
    return id;
  }

}