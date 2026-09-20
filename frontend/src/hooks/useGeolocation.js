import { useState, useCallback } from "react";

/**
 * Deliberately does NOT auto-run on mount. Calling getCurrentPosition
 * immediately when a page loads triggers the browser's permission
 * prompt instantly, which reflows the page and reads as a flicker —
 * especially in dev, where React StrictMode double-invokes effects.
 * capture() is only ever called from a user click.
 */
export function useGeolocation() {
  const [coordinates, setCoordinates] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState(null);

  const capture = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      setError("Geolocation is not supported by this browser");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates([position.coords.longitude, position.coords.latitude]);
        setStatus("success");
      },
      (err) => {
        setStatus("error");
        setError(err.message || "Could not get your location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { coordinates, status, error, capture };
}