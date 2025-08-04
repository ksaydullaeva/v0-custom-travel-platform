import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Leaflet must be loaded dynamically because it relies on window
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
import "leaflet/dist/leaflet.css";

interface Props {
  open: boolean;
  initialLat: number;
  initialLng: number;
  address?: string;
  onClose: () => void;
  onSelect: (lat: number, lng: number) => void;
}

export default function MapPickerModal({ open, initialLat, initialLng, address, onClose, onSelect }: Props) {
  const [position, setPosition] = useState<[number, number]>([initialLat || 0, initialLng || 0]);

  // Geocode when opened if no coords but address given
  useEffect(() => {
    if (!open) return;
    if ((initialLat !== 0 || initialLng !== 0) || !address) return;
    (async () => {
      try {
        const q = encodeURIComponent(address);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`);
        const data = await res.json();
        if (data && data.length) {
          setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch (_) {
        /* ignore */
      }
    })();
  }, [open, address, initialLat, initialLng]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>Select location</DialogTitle>
        </DialogHeader>
        <div className="h-96 w-full">
          {open && (
            <MapContainer
              center={position}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              whenReady={(map) => {
                map.on("click", (e: any) => {
                  const { lat, lng } = e.latlng;
                  setPosition([lat, lng]);
                });
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position} />
            </MapContainer>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSelect(position[0], position[1])}>Use this location</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
