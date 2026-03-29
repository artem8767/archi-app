"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./LocationMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-xl bg-zone-deep text-zone-muted">
      …
    </div>
  ),
});

type Props = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  label?: string;
};

export function LocationPicker({ lat, lng, onChange, label }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg bg-archi-600 px-4 py-2 text-sm font-medium text-black hover:bg-archi-500"
      >
        {label ?? "Map"}
      </button>
      {open && (
        <div className="mt-3 overflow-hidden rounded-xl border border-zone-edge">
          <MapInner lat={lat} lng={lng} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
