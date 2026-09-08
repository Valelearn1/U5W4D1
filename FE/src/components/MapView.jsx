import { useCallback, useEffect, useRef } from 'react'
import { Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps'

// Centro iniziale della mappa (Bologna) e zoom di partenza.
const DEFAULT_CENTER = { lat: 44.4949, lng: 11.3426 }
const DEFAULT_ZOOM = 14

// Colore del marker in base alla tipologia del POI.
const PIN_COLORS = {
  BUCA: '#e63946',
  LAMPIONE: '#f4a261',
  TOMBINO: '#457b9d',
  PARCO: '#2a9d8f',
}

// mapId: serve agli AdvancedMarker. "DEMO_MAP_ID" va bene per sviluppo;
// in produzione se ne crea uno vero nella console Google.
const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID ?? 'DEMO_MAP_ID'

export default function MapView({
  pois,
  selectedId,
  onSelect,
  onBoundsChange,
  onMapClick,
  draftPosition, // { lat, lng } del POI in via di creazione, o null
}) {
  const map = useMap()
  const debounceRef = useRef(null)

  // Copia sempre aggiornata di "pois", per leggerla nell'effetto sotto senza
  // rimetterla tra le dipendenze (altrimenti a ogni refetch la mappa "salta").
  const poisRef = useRef(pois)
  poisRef.current = pois

  // Dopo ogni pan/zoom (evento "idle") legge i 4 confini del riquadro visibile
  // e li comunica al parent, con un debounce di 300ms per non chiamare il
  // backend a ogni frame mentre si trascina la mappa.
  const handleIdle = useCallback(
    (event) => {
      const bounds = event.map.getBounds()
      if (!bounds) return

      const ne = bounds.getNorthEast()
      const sw = bounds.getSouthWest()
      const bbox = {
        minLat: sw.lat(),
        maxLat: ne.lat(),
        minLng: sw.lng(),
        maxLng: ne.lng(),
      }

      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => onBoundsChange(bbox), 300)
    },
    [onBoundsChange],
  )

  // Quando cambia il POI selezionato (click su mappa o su lista), centra la mappa su di lui.
  useEffect(() => {
    if (!map || selectedId == null) return
    const poi = poisRef.current.find((p) => p.id === selectedId)
    if (poi) {
      map.panTo({ lat: Number(poi.latitudine), lng: Number(poi.longitudine) })
    }
  }, [map, selectedId])

  // Click sulla mappa: ricava lat/lng dal punto cliccato e li passa al parent.
  // La libreria puo' fornire il punto come detail.latLng (oggetto {lat,lng})
  // oppure, nelle versioni piu' vecchie, come event.latLng con metodi lat()/lng().
  const handleClick = useCallback(
    (event) => {
      const d = event.detail?.latLng
      const raw = event.latLng
      let lat, lng
      if (d) {
        lat = d.lat
        lng = d.lng
      } else if (raw && typeof raw.lat === 'function') {
        lat = raw.lat()
        lng = raw.lng()
      } else {
        return
      }
      if (onMapClick) onMapClick({ lat, lng })
    },
    [onMapClick],
  )

  return (
    <Map
      mapId={MAP_ID}
      defaultCenter={DEFAULT_CENTER}
      defaultZoom={DEFAULT_ZOOM}
      gestureHandling="greedy"
      disableDefaultUI={false}
      clickableIcons={false}
      onIdle={handleIdle}
      onClick={handleClick}
      style={{ width: '100%', height: '100%' }}
    >
      {pois.map((poi) => {
        const selected = poi.id === selectedId
        return (
          <AdvancedMarker
            key={poi.id}
            position={{ lat: Number(poi.latitudine), lng: Number(poi.longitudine) }}
            onClick={() => onSelect(poi.id)}
            zIndex={selected ? 10 : 1}
          >
            <Pin
              background={PIN_COLORS[poi.tipologia] ?? '#666'}
              borderColor={selected ? '#1a1a2e' : '#ffffff'}
              glyphColor="#ffffff"
              scale={selected ? 1.4 : 1}
            />
          </AdvancedMarker>
        )
      })}

      {/* Marker rosso provvisorio nel punto cliccato, finche' il POI non e' salvato */}
      {draftPosition && (
        <AdvancedMarker position={draftPosition} zIndex={20}>
          <Pin background="#e63946" borderColor="#1a1a2e" glyphColor="#ffffff" scale={1.4} />
        </AdvancedMarker>
      )}
    </Map>
  )
}
