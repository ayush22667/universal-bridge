import React from 'react';
import type { Location } from '../types';

interface MapViewProps {
  location: Location;
}

export const MapView: React.FC<MapViewProps> = ({ location }) => {
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d100000!2d${location.lng}!3d${location.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1`;

  return (
    <div 
      style={{ 
        width: '100%', 
        height: '300px', 
        borderRadius: 'var(--radius-lg)', 
        overflow: 'hidden',
        border: '1px solid var(--color-border)'
      }}
    >
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map showing ${location.description}`}
        aria-label={`Google Maps showing location: ${location.description}`}
      />
    </div>
  );
};
