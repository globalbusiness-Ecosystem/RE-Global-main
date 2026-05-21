// Type definitions for leaflet.heat
declare global {
  namespace L {
    interface HeatLatLngTuple extends Array<number> {
      0: number; // latitude
      1: number; // longitude
      2: number; // intensity (0-1)
    }

    interface HeatLayerOptions {
      radius?: number;
      blur?: number;
      max?: number;
      maxZoom?: number;
      minOpacity?: number;
      gradient?: Record<number, string>;
    }

    function heatLayer(
      latlngs: Array<[number, number, number]>,
      options?: HeatLayerOptions
    ): HeatLatLng;

    class HeatLatLng extends Layer {
      addLatLng(latlng: [number, number, number]): this;
      setLatLngs(latlngs: Array<[number, number, number]>): this;
    }
  }
}

export {};
