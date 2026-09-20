import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * react-leaflet's default marker icon references image paths that break
 * under Vite's bundling (a well-known gotcha — the icon silently fails
 * to load, leaving a blank/broken pin). Instead of fighting asset
 * resolution, we build markers from a small inline SVG data URI, which
 * also lets the pin match our actual brand colors instead of Leaflet's
 * default blue.
 */
function createPinIcon(color) {
  const svg = `
    <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z" fill="${color}"/>
      <circle cx="15" cy="15" r="6" fill="white"/>
    </svg>`;
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -36],
  });
}

const TEAL_PIN = createPinIcon("#0f766e");
const CORAL_PIN = createPinIcon("#f97316");

/**
 * Shows one center marker (the current user) plus a shaded circle for
 * the actual radius the backend's matching engine searches (15km by
 * default — see DEFAULT_RADIUS_KM in matchingEngine.js). This turns an
 * abstract "why wasn't I matched" question into something visible.
 */
export function CoverageMap({ coordinates, label, radiusKm = 15, color = "teal", height = 280 }) {
  if (!coordinates || coordinates.length !== 2) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-ink-100 text-sm text-ink-400"
        style={{ height }}
      >
        No location on file
      </div>
    );
  }

  const [lng, lat] = coordinates;
  const position = [lat, lng];
  const icon = color === "coral" ? CORAL_PIN : TEAL_PIN;
  const circleColor = color === "coral" ? "#f97316" : "#0f766e";

  return (
    <div className="rounded-xl overflow-hidden border border-ink-200" style={{ height }}>
      <MapContainer center={position} zoom={10} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle
          center={position}
          radius={radiusKm * 1000}
          pathOptions={{ color: circleColor, fillColor: circleColor, fillOpacity: 0.08, weight: 1.5 }}
        />
        <Marker position={position} icon={icon}>
          <Popup>
            <span className="text-sm font-medium">{label}</span>
            <br />
            <span className="text-xs text-ink-500">{radiusKm}km match radius</span>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}