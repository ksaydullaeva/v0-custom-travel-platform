import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
// import "leaflet/dist/leaflet.css";

// Fix for default markers in Next.js
if (typeof window !== 'undefined') {
  delete (window as any).L;
  const L = require('leaflet');
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Leaflet must be loaded dynamically because it relies on window
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });

interface Props {
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export default function EmbeddedMap({ address, city, country, lat, lng, onLocationChange }: Props) {
  const [position, setPosition] = useState<[number, number]>([lat || 41.2995, lng || 69.2401]); // Default to Tashkent
  const [showMarker, setShowMarker] = useState(false);
  const [mapKey, setMapKey] = useState(0); // Force re-render
  const mapRef = useRef<any>(null);

  // Geocode when address/city/country changes
  useEffect(() => {
    (async () => {
      try {
        let query = '';
        let shouldShowMarker = false;
        
        if (address.trim()) {
          // If address is provided, use address + city + country and show marker
          query = `${address}, ${city}, ${country}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '');
          shouldShowMarker = true;
        } else if (city.trim() || country.trim()) {
          // If only city/country, use those for centering but no marker
          query = `${city}, ${country}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '');
          shouldShowMarker = false;
        } else {
          // No location info, hide marker
          setShowMarker(false);
          return;
        }

        if (query) {
          const q = encodeURIComponent(query);
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`);
          const data = await res.json();
          if (data && data.length) {
            const newPos: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            setPosition(newPos);
            setShowMarker(shouldShowMarker);
            if (shouldShowMarker) {
              onLocationChange(newPos[0], newPos[1]);
            }
          }
        }
      } catch (_) {
        /* ignore geocoding errors */
      }
    })();
  }, [address, city, country]);

  // Update position when lat/lng props change externally
  useEffect(() => {
    if (lat !== 0 || lng !== 0) {
      setPosition([lat, lng]);
      setShowMarker(true);
      setMapKey(prev => prev + 1); // Force map re-render
    }
  }, [lat, lng]);

  return (
    <div className="h-64 w-full border rounded-md overflow-hidden">
      {typeof window !== 'undefined' && (
        <MapContainer
          key={mapKey}
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
          whenReady={() => {
            if (mapRef.current) {
              // Force map to invalidate size and refresh tiles
              setTimeout(() => {
                if (mapRef.current) {
                  mapRef.current.invalidateSize();
                  mapRef.current.setView(position, 13);
                }
              }, 100);
              
              mapRef.current.on('click', (e: any) => {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                setShowMarker(true);
                onLocationChange(lat, lng);
              });
            }
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            subdomains={['a', 'b', 'c']}
          />
          {showMarker && <Marker position={position} />}
        </MapContainer>
      )}
    </div>
  );
}
