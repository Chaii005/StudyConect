// src/utils/geocoding.js
// Gọi Google Geocoding API để lấy lat/lng từ địa chỉ text
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/**
 * Geocode a plain text address → { lat, lng } hoặc null nếu thất bại
 */
export async function geocodeAddress(address) {
  if (!address?.trim() || !API_KEY || API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&language=vi&key=${API_KEY}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.status === 'OK' && json.results?.[0]) {
      const loc = json.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng, formattedAddress: json.results[0].formatted_address };
    }
  } catch {
    // Silent fail — chỉ mất preview, không ảnh hưởng chức năng chính
  }
  return null;
}

/**
 * Tạo URL ảnh bản đồ tĩnh (Maps Static API)
 */
export function staticMapUrl({ lat, lng, zoom = 15, width = 480, height = 180 }) {
  if (!API_KEY || API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') return null;
  return (
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${lat},${lng}` +
    `&zoom=${zoom}` +
    `&size=${width}x${height}` +
    `&scale=2` +
    `&markers=color:red%7C${lat},${lng}` +
    `&style=feature:all|element:geometry|color:0x1a1a2e` +
    `&style=feature:water|color:0x0f3460` +
    `&style=feature:road|color:0x16213e` +
    `&key=${API_KEY}`
  );
}

/**
 * Tạo link mở Google Maps từ địa chỉ text (KHÔNG cần API key)
 */
export function googleMapsSearchUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export async function autocompletePlaces(input, sessionToken) {
  if (!input?.trim() || input.trim().length < 2 || !API_KEY || API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return [];
  }
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'suggestions.placePrediction.text,suggestions.placePrediction.placeId',
      },
      body: JSON.stringify({ input, languageCode: 'vi', regionCode: 'VN', sessionToken }),
    });
    if (res.status === 403) {
      const json = await res.json().catch(() => ({}));
      return { error: 403, message: json.error?.message || 'Permission Denied (403)' };
    }
    const json = await res.json();
    if (!json.suggestions) return [];
    return json.suggestions
      .filter(s => s.placePrediction)
      .map(s => ({ placeId: s.placePrediction.placeId, text: s.placePrediction.text.text }));
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('autocompletePlaces catch error:', err);
    }
    return [];
  }
}

export async function getPlaceDetails(placeId) {
  if (!placeId || !API_KEY) return null;
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=location,formattedAddress&key=${API_KEY}`
    );
    if (res.status === 403) {
      const json = await res.json().catch(() => ({}));
      return { error: 403, message: json.error?.message || 'Permission Denied (403)' };
    }
    const json = await res.json();
    if (json.location) {
      return { lat: json.location.latitude, lng: json.location.longitude, formattedAddress: json.formattedAddress };
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('getPlaceDetails catch error:', err);
    }
  }
  return null;
}

