
export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
}

export interface LayoutConfig {
  radius: number;
  gap: number;
  itemWidth: number;
  heightStep: number;
  baseHeight: number;
}
