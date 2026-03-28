import React, { useState, useCallback } from 'react';

const API_BASE: string = import.meta.env.VITE_API_URL ?? '';

interface Place {
  name: string;
  address: string;
  rating?: number;
  openNow: boolean | null;
  mapsUrl: string;
}

interface NearbyResult {
  places: Place[];
  label: string;
  icon: string;
}

interface NearbyServicesProps {
  lat: number;
  lng: number;
}

const SERVICE_TYPES = [
  { type: 'hospital', label: 'Hospitals', icon: '🏥' },
  { type: 'police', label: 'Police', icon: '👮' },
  { type: 'pharmacy', label: 'Pharmacy', icon: '💊' },
  { type: 'fire_station', label: 'Fire Dept', icon: '🚒' },
];

export const NearbyServices: React.FC<NearbyServicesProps> = ({ lat, lng }) => {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [result, setResult] = useState<NearbyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNearby = useCallback(async (type: string) => {
    if (activeType === type) {
      setActiveType(null);
      setResult(null);
      return;
    }
    setActiveType(type);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/nearby?lat=${lat}&lng=${lng}&type=${type}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to fetch nearby places');
      }
      const data: NearbyResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch nearby places');
    } finally {
      setLoading(false);
    }
  }, [lat, lng, activeType]);

  return (
    <div className="nearby-services" role="region" aria-label="Nearby emergency services">
      <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>🗺️ Find Nearby Services</h3>

      <div className="nearby-types">
        {SERVICE_TYPES.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => fetchNearby(type)}
            className={`nearby-type-btn ${activeType === type ? 'nearby-type-btn--active' : ''}`}
            aria-pressed={activeType === type}
          >
            <span aria-hidden="true">{icon}</span> {label}
          </button>
        ))}
      </div>

      {loading && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.75rem' }}>
          🔍 Searching nearby...
        </p>
      )}

      {error && (
        <p style={{ color: 'var(--color-urgency-critical)', fontSize: '0.875rem', marginTop: '0.75rem' }}>
          {error}
        </p>
      )}

      {result && result.places.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.75rem' }}>
          No {result.label.toLowerCase()} found within 5km.
        </p>
      )}

      {result && result.places.length > 0 && (
        <div className="nearby-results" role="list">
          {result.places.map((place, i) => (
            <a
              key={i}
              href={place.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="nearby-place-card"
              role="listitem"
              aria-label={`${place.name} — ${place.address}`}
            >
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', marginBottom: '0.2rem' }}>{place.name}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{place.address}</span>
              </div>
              <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                {place.rating && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-accent-emerald)' }}>
                    ⭐ {place.rating}
                  </span>
                )}
                {place.openNow !== null && (
                  <span style={{ display: 'block', fontSize: '0.75rem', color: place.openNow ? 'var(--color-accent-emerald)' : 'var(--color-urgency-critical)' }}>
                    {place.openNow ? 'Open now' : 'Closed'}
                  </span>
                )}
                <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-blue-light)' }}>
                  Open in Maps →
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
