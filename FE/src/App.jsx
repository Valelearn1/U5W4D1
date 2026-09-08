import { useCallback, useRef, useState } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import MapView from './components/MapView'
import PoiForm from './components/PoiForm'
import {
  getInViewport,
  createPoi,
  updatePoi,
  deletePoi,
} from './api/poiApi'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

export default function App() {
  // Stato condiviso da mappa e lista.
  const [pois, setPois] = useState([]) // POI attualmente nel viewport
  const [selectedId, setSelectedId] = useState(null) // POI evidenziato
  const [editing, setEditing] = useState(null) // null = form chiuso | {} = nuovo | poi = modifica
  const [error, setError] = useState(null)

  // Ultimo bounding box ricevuto dalla mappa: serve per rifare la fetch
  // dopo create / update / delete.
  const bboxRef = useRef(null)

  const loadPois = useCallback(async (bbox) => {
    if (!bbox) return
    try {
      const data = await getInViewport(bbox)
      setPois(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  // Chiamata da MapView dopo ogni pan/zoom (gia' con debounce lato MapView).
  const handleBoundsChange = useCallback(
    (bbox) => {
      bboxRef.current = bbox
      loadPois(bbox)
    },
    [loadPois],
  )

  const reload = useCallback(() => loadPois(bboxRef.current), [loadPois])

  // Submit del form: il parent decide se creare o aggiornare.
  // Gli errori vengono rilanciati: PoiForm li cattura e li mostra.
  const handleSubmit = async (body) => {
    if (editing?.id) {
      await updatePoi(editing.id, body)
    } else {
      const created = await createPoi(body)
      setSelectedId(created.id)
    }
    await reload()
    setEditing(null)
  }

  const handleDelete = async () => {
    if (!editing?.id) return
    if (!window.confirm('Eliminare questo POI?')) return
    try {
      await deletePoi(editing.id)
      if (selectedId === editing.id) setSelectedId(null)
      await reload()
      setEditing(null)
    } catch (err) {
      setError(err.message)
    }
  }

  // Click sulla mappa: apre il form "nuovo POI" con lat/lng gia' compilate
  // dal punto cliccato. Se stavo modificando un POI esistente, la modifica
  // viene abbandonata a favore della creazione nel punto cliccato.
  const handleMapClick = useCallback(({ lat, lng }) => {
    setEditing({ latitudine: lat, longitudine: lng })
  }, [])

  // Posizione del marker rosso provvisorio: c'e' solo mentre creo un nuovo POI
  // e ho gia' delle coordinate valide.
  const draftPosition =
    editing && !editing.id && editing.latitudine !== '' && editing.latitudine != null
      ? { lat: Number(editing.latitudine), lng: Number(editing.longitudine) }
      : null

  if (!API_KEY) {
    return (
      <div style={{ padding: 24 }}>
        Manca <code>VITE_GOOGLE_MAPS_API_KEY</code> nel file <code>.env</code>.
        Aggiungila e riavvia <code>npm run dev</code>.
      </div>
    )
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <div style={{ display: 'flex', height: '100%' }}>
        {/* Lista laterale: mostra SOLO i POI nel viewport corrente */}
        <aside
          style={{
            width: 340,
            flexShrink: 0,
            borderRight: '1px solid #ddd',
            overflowY: 'auto',
            padding: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h2 style={{ fontSize: 18 }}>POI nel riquadro ({pois.length})</h2>
            {editing === null && (
              <button type="button" onClick={() => setEditing({})}>
                + Aggiungi
              </button>
            )}
          </div>

          {error && <p style={{ color: '#c0392b', marginBottom: 12 }}>{error}</p>}

          {editing !== null && (
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <PoiForm
                key={editing.id ?? 'new'}
                initialValue={editing}
                onSubmit={handleSubmit}
                onCancel={() => setEditing(null)}
                onDelete={handleDelete}
              />
              {!editing.id && (
                <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                  Suggerimento: clicca sulla mappa per impostare la posizione.
                </p>
              )}
            </div>
          )}

          <ul style={{ listStyle: 'none' }}>
            {pois.map((poi) => (
              <li
                key={poi.id}
                onClick={() => setSelectedId(poi.id)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                  background: poi.id === selectedId ? '#eef2ff' : 'transparent',
                }}
              >
                <span>
                  <strong>{poi.tipologia}</strong>
                  <br />
                  <small>
                    {poi.descrizione ||
                      poi.indirizzo ||
                      `${poi.latitudine}, ${poi.longitudine}`}
                  </small>
                </span>
                <button
                  type="button"
                  title="Modifica"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedId(poi.id)
                    setEditing(poi)
                  }}
                >
                  ✎
                </button>
              </li>
            ))}
            {pois.length === 0 && (
              <li>
                <small>Nessun POI in questa zona.</small>
              </li>
            )}
          </ul>
        </aside>

        {/* Mappa */}
        <main style={{ flex: 1 }}>
          <MapView
            pois={pois}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onBoundsChange={handleBoundsChange}
            onMapClick={handleMapClick}
            draftPosition={draftPosition}
          />
        </main>
      </div>
    </APIProvider>
  )
}
