/**
 * VR Property Tour - Premium Data Structures & Types
 */

export interface Hotspot {
  pitch: number;
  yaw: number;
  targetRoom: number;
  text: string;
  cssClass?: string;
}

export interface PropertyImage {
  id: string;
  url: string;
  caption: string;
  featured?: boolean;
}

export interface VRRoom {
  id: number;
  name: string;
  imageUrl: string;
  pitch?: number;
  yaw?: number;
  hfov?: number;
  hotspots: Hotspot[];
  description?: string;
  price?: number;
  propertyImages?: PropertyImage[];
}

export interface VRPropertyTour {
  propertyId: string;
  propertyName: string;
  rooms: VRRoom[];
  price?: number;
  piPrice?: number;
}

export interface DesignVariant {
  name: 'current' | 'furnished';
  label: string;
  description: string;
}

export type VRTourConfig = VRPropertyTour;
export type VRScene = VRRoom;
