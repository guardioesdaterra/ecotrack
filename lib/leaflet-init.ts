// This module properly initializes Leaflet for client-side usage in Next.js

// Type definitions for Leaflet
declare global {
  interface Window {
    L: any;
  }
}

let L: any = null;

// Initialize Leaflet only on the client side
export function initLeaflet() {
  if (typeof window === 'undefined') return null;
  
  try {
    // Check if Leaflet is already initialized
    if (window.L) {
      return window.L;
    }
    
    // Import Leaflet
    const leaflet = require('leaflet');
    L = leaflet;
    window.L = leaflet;
    
    // Fix icon paths which is a common issue with Next.js + Leaflet
    try {
      const iconRetinaUrl = require('leaflet/dist/images/marker-icon-2x.png').default;
      const iconUrl = require('leaflet/dist/images/marker-icon.png').default;
      const shadowUrl = require('leaflet/dist/images/marker-shadow.png').default;
      
      delete L.Icon.Default.prototype._getIconUrl;
      
      L.Icon.Default.mergeOptions({
        iconRetinaUrl,
        iconUrl,
        shadowUrl,
      });
    } catch (iconError) {
      console.error("Error setting Leaflet icon paths:", iconError);
    }
    
    return L;
  } catch (e) {
    console.error("Error initializing Leaflet:", e);
    return null;
  }
} 