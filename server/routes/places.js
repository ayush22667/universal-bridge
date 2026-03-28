import { Router } from 'express';
import { log } from '../lib/logger.js';

const MAPS_KEY = process.env.GOOGLE_CLOUD_API_KEY;

const TYPE_LABELS = {
  hospital: 'Nearest Hospitals',
  police: 'Nearest Police Stations',
  pharmacy: 'Nearest Pharmacies',
  fire_station: 'Nearest Fire Stations',
};

const TYPE_ICONS = {
  hospital: '🏥',
  police: '👮',
  pharmacy: '💊',
  fire_station: '🚒',
};

export function placesRouter() {
  const router = Router();

  router.get('/', async (req, res) => {
    const { lat, lng, type = 'hospital' } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }

    if (!MAPS_KEY) {
      return res.status(503).json({ error: 'Maps API key not configured (GOOGLE_CLOUD_API_KEY)' });
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=${type}&key=${MAPS_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        log('warn', 'Places API error', { status: data.status, type });
        return res.status(500).json({ error: `Places API: ${data.status}` });
      }

      const places = (data.results || []).slice(0, 3).map(place => ({
        name: place.name,
        address: place.vicinity,
        rating: place.rating,
        openNow: place.opening_hours?.open_now ?? null,
        placeId: place.place_id,
        mapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        phone: place.formatted_phone_number || null,
      }));

      return res.json({
        places,
        type,
        label: TYPE_LABELS[type] || type,
        icon: TYPE_ICONS[type] || '📍',
      });
    } catch (err) {
      log('error', 'Places API failed', { error: err.message });
      return res.status(500).json({ error: 'Failed to fetch nearby places' });
    }
  });

  return router;
}
