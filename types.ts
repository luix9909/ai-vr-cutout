
export type MediaType = 'image' | 'video';

export interface SpatialItem {
  id: string;
  url: string;
  type: MediaType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

export interface ARSettings {
  passthroughEnabled: boolean;
  intensity: number;
}
