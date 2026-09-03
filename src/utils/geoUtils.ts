/**
 * Utility for calculating geospatial distance between coordinates using Haversine formula
 */

export const calculateHaversineDistanceMeters = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) return 0;
  if (lat1 === lat2 && lng1 === lng2) return 0;
  
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

export const calculatePipeRouteDistance = (
  startCoords: { lat: number; lng: number } | null | undefined,
  endCoords: { lat: number; lng: number } | null | undefined,
  waypoints: { lat: number; lng: number }[] = []
): number => {
  if (!startCoords || !endCoords) return 0;
  if (isNaN(startCoords.lat) || isNaN(startCoords.lng) || isNaN(endCoords.lat) || isNaN(endCoords.lng)) return 0;

  let totalDistance = 0;
  let prev = startCoords;

  if (Array.isArray(waypoints)) {
    for (const wp of waypoints) {
      if (wp && typeof wp.lat === 'number' && typeof wp.lng === 'number') {
        totalDistance += calculateHaversineDistanceMeters(prev.lat, prev.lng, wp.lat, wp.lng);
        prev = wp;
      }
    }
  }

  totalDistance += calculateHaversineDistanceMeters(prev.lat, prev.lng, endCoords.lat, endCoords.lng);
  return Math.round(totalDistance);
};
