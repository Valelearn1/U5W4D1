import { useState } from 'react'

const TIPOLOGIE = ['BUCA', 'LAMPIONE', 'TOMBINO', 'PARCO']

const EMPTY = {
  tipologia: 'BUCA',
  latitudine: '',
  longitudine: '',
  indirizzo: '',
  descrizione: '',
}

// Form per creare o modificare un POI.
// Props:
//   initialValue : POI da modificare (con id) oppure null/parziale per crearne uno nuovo
//   onSubmit(body) : async, il parent decide se fare create o update
//   onCancel()     : chiude il form
//   onDelete()     : mostrato solo in modifica
export default function PoiForm({ initialValue, onSubmit, onCancel, onDelete }) {
  const isEdit = Boolean(initialValue?.id)

  const [form, setForm] = useState(() => ({
    ...EMPTY,
    tipologia: initialValue?.tipologia ?? EMPTY.tipologia,
    latitudine: initialValue?.latitudine ?? '',
    longitudine: initialValue?.longitudine ?? '',
    indirizzo: initialValue?.indirizzo ?? '',
    descrizione: initialValue?.descrizione ?? '',
  }))
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validazione lato client, speculare a quella del backend.
    const lat = Number(form.latitudine)
    const lng = Number(form.longitudine)
    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      return setError('Latitudine non valida (-90..90)')
    }
    if (Number.isNaN(lng) || lng < -180 || lng > 180) {
      return setError('Longitudine non valida (-180..180)')
    }

    const body = {
      tipologia: form.tipologia,
      latitudine: lat,
      longitudine: lng,
      indirizzo: form.indirizzo.trim() || null,
      descrizione: form.descrizione.trim() || null,
    }

    try {
      setSaving(true)
      await onSubmit(body) // se fallisce, il parent rilancia l'errore
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const labelStyle = { display: 'grid', gap: 2, fontSize: 13 }
  const inputStyle = { padding: '6px 8px', font: 'inherit', width: '100%' }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
      <h3 style={{ fontSize: 16 }}>
        {isEdit ? `Modifica POI #${initialValue.id}` : 'Nuovo POI'}
      </h3>

      <label style={labelStyle}>
        Tipologia
        <select style={inputStyle} value={form.tipologia} onChange={update('tipologia')}>
          {TIPOLOGIE.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Latitudine
        <input
          style={inputStyle}
          type="number"
          step="any"
          value={form.latitudine}
          onChange={update('latitudine')}
          required
        />
      </label>

      <label style={labelStyle}>
        Longitudine
        <input
          style={inputStyle}
          type="number"
          step="any"
          value={form.longitudine}
          onChange={update('longitudine')}
          required
        />
      </label>

      <label style={labelStyle}>
        Indirizzo (opzionale)
        <input
          style={inputStyle}
          type="text"
          maxLength={255}
          value={form.indirizzo}
          onChange={update('indirizzo')}
        />
      </label>

      <label style={labelStyle}>
        Descrizione (opzionale)
        <textarea
          style={inputStyle}
          maxLength={255}
          rows={2}
          value={form.descrizione}
          onChange={update('descrizione')}
        />
      </label>

      {error && <p style={{ color: '#c0392b', fontSize: 13 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={saving}>
          {saving ? 'Salvo…' : 'Salva'}
        </button>
        <button type="button" onClick={onCancel} disabled={saving}>
          Annulla
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={onDelete}
            disabled={saving}
            style={{ marginLeft: 'auto', color: '#c0392b' }}
          >
            Elimina
          </button>
        )}
      </div>
    </form>
  )
}
