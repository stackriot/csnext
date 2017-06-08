
export interface ILayerDescription {
  id: string;
  type: string;
  url: string;
  options?: {
    attribution: string;
  };
}

export interface IMapLayer {
  base: ILayerDescription[];
  overlay: ILayerDescription[];
}
