// Tutte le chiamate HTTP verso il backend Spring stanno qui.
// I componenti non usano mai fetch direttamente: chiamano queste funzioni.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const POIS_URL = `${BASE_URL}/api/pois`

// Wrapper attorno a fetch:
// - se la risposta non e' ok, legge il messaggio d'errore del backend e lancia un Error
// - se e' 204 (No Content, es. DELETE) restituisce null
// - altrimenti restituisce il JSON
async function request(url, options) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    let message = `Errore ${res.status}`
    try {
      const body = await res.json() // ErrorResponseDTO: { message, errors, ... }
      if (body.errors?.length) message = body.errors.join(' · ')
      else if (body.message) message = body.message
    } catch {
      // corpo non JSON: teniamo il messaggio generico
    }
    throw new Error(message)
  }

  if (res.status === 204) return null
  return res.json()
}

// GET /api/pois?minLat=..&maxLat=..&minLng=..&maxLng=..
// Restituisce i POI dentro il rettangolo visibile della mappa.
export function getInViewport({ minLat, maxLat, minLng, maxLng }) {
  const params = new URLSearchParams({ minLat, maxLat, minLng, maxLng })
  return request(`${POIS_URL}?${params}`)
}

// GET /api/pois/{id}
export function getById(id) {
  return request(`${POIS_URL}/${id}`)
}

// POST /api/pois  - body: { tipologia, latitudine, longitudine, indirizzo, descrizione }
export function createPoi(body) {
  return request(POIS_URL, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// PUT /api/pois/{id}
export function updatePoi(id, body) {
  return request(`${POIS_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

// DELETE /api/pois/{id}  - risposta 204, nessun corpo
export function deletePoi(id) {
  return request(`${POIS_URL}/${id}`, { method: 'DELETE' })
}
