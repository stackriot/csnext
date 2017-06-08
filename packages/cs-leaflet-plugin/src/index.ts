import * as Leaflet from 'leaflet';
import { FrameworkConfiguration } from "aurelia-framework/dist/aurelia-framework";

// Export all classes that you are using (not sure about HTML files yet)
export * from './lib/leaflet.html';
export * from './lib/leaflet';
export * from './lib/leaflet-exception';
export * from './lib/leaflet-defaults';
export * from './lib/layer-factory';

export const configure = (frameworkConfig: FrameworkConfiguration, {
    LeafletDefaultImagePath = 'node_modules/leaflet/dist/images/'
  } = {}) => {
  Leaflet.Icon.Default.imagePath = LeafletDefaultImagePath;
  // Specify relative path to custom element / plugin
  frameworkConfig.globalResources('./lib/leaflet');
};
