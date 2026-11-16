'use client';

import { useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { calendarGames } from '@/lib/game-catalog';
import CalendarThumbnail from './calendar-thumbnail';

const photoSlots = [
  ...Array.from({ length: 5 }, (_, index) => ({ type: 'cover', number: index + 1, label: `Foto de portada ${index + 1}` })),
  ...Array.from({ length: 24 }, (_, index) => ({ type: 'gift', number: index + 1, label: `Puerta ${String(index + 1).padStart(2, '0')}` }))
];

const MAX_FILE_SIZE = 50 * 1024 * 1024;
let browserSupabase;

function slotKey(type, number) {
  return `${type}-${number}`;
}

function getBrowserSupabase() {
  if (!browserSupabase) {
    browserSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return browserSupabase;
}

export default function EditorForm({ token, design, designLabel, fields, settings: initialSettings, media }) {
  const textFields = fields.filter(field => !field.group);
  const scratchFields = fields.filter(field => field.group === 'scratch');
  const scratchToggle = scratchFields.find(field => field.key === 'scratchEnabled');
  const scratchDetailFields = scratchFields.filter(field => field.key !== 'scratchEnabled');
  const [settings, setSettings] = useState(initialSettings);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [gamesMessage, setGamesMessage] = useState('');
  const [activeGiftSlot, setActiveGiftSlot] = useState(null);
  const [showGiftGames, setShowGiftGames] = useState(false);
  const [imageGame, setImageGame] = useState(null);
  const [gameBusy, setGameBusy] = useState(false);
  const [busyAction, setBusyAction] = useState(null);
  const busyActionRef = useRef(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTarget, setPreviewTarget] = useState('title');
  const gameBusyRef = useRef(false);
  const uploadInputRef = useRef(null);
  const pendingUploadRef = useRef(null);
  const [savedMedia, setSavedMedia] = useState(() => Object.fromEntries(
    media.map(item => [slotKey(item.slot_type, item.slot_number), item])
  ));
  const [messages, setMessages] = useState({});
  const [captions, setCaptions] = useState(() => Object.fromEntries(
    media.filter(item => item.slot_type === 'gift').map(item => [slotKey(item.slot_type, item.slot_number), item.caption || ''])
  ));
  const [coverOrder, setCoverOrder] = useState(() => Array.isArray(initialSettings.coverOrder) ? initialSettings.coverOrder : [1, 2, 3, 4, 5]);
  const [doorOrder, setDoorOrder] = useState(() => Array.isArray(initialSettings.doorOrder) ? initialSettings.doorOrder : null);
  const scratchReady = scratchDetailFields.every(field => {
    const value = String(settings[field.key] ?? field.defaultValue ?? '').trim();
    if (!value) return false;
    if (field.type !== 'date') return true;
    const date = new Date(`${value}T00:00:00.000Z`);
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  });

  function selectPreviewTarget(name) {
    setPreviewTarget(name);
    setPreviewOpen(false);
    const ids = { music: 'music-heading', scratchCircles: 'games-heading' };
    const id = name.startsWith('cover-') || name.startsWith('gift-') ? `slot-${name}` : ids[name] || name;
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)) element.focus({ preventScroll: true });
  }

  const coverPhotos = Object.fromEntries([1, 2, 3, 4, 5].map(number => {
    const item = savedMedia[slotKey('cover', number)];
    return [number, item?.media_type === 'image' ? item.url : null];
  }));
  const previewGifts = Array.from({ length: 24 }, (_, index) => ({
    hasContent: Boolean(savedMedia[slotKey('gift', index + 1)] || settings.giftGames?.[index + 1])
  }));

  function updateSettings(event) {
    const { name, type, checked, value } = event.target;
    setSettings(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function renderSettingField(field) {
    const commonProps = {
      id: field.key,
      name: field.key,
      required: field.group === 'scratch' && field.key !== 'scratchEnabled' ? Boolean(settings.scratchEnabled) : field.required,
      maxLength: field.maxLength,
      min: field.min,
      max: field.max,
      value: settings[field.key] ?? field.defaultValue ?? '',
      onChange: updateSettings
    };

    let input;
    if (field.type === 'textarea') {
      input = <textarea {...commonProps} rows={field.rows || 3} />;
    } else if (field.type === 'select') {
      input = <select {...commonProps}>
        {(field.options || []).map(option => {
          const item = typeof option === 'string' ? { value: option, label: option } : option;
          return <option key={item.value} value={item.value}>{item.label}</option>;
        })}
      </select>;
    } else if (field.type === 'checkbox') {
      input = <input id={field.key} name={field.key} type="checkbox" checked={Boolean(settings[field.key])} disabled={field.key === 'scratchEnabled' && !scratchReady && !settings.scratchEnabled} onChange={updateSettings} />;
    } else {
      const type = ['date', 'email', 'number', 'text', 'url'].includes(field.type) ? field.type : 'text';
      input = <input {...commonProps} type={type} />;
    }

    return <label className={`editor-field editor-field-${field.type}`} htmlFor={field.key} key={field.key}>
      {field.label}
      {input}
      {field.helpText && <small>{field.helpText}</small>}
    </label>;
  }

  async function withBusy(label, action) {
    if (busyActionRef.current) return;
    busyActionRef.current = true;
    setBusyAction(label);
    try {
      await action();
    } finally {
      busyActionRef.current = false;
      setBusyAction(null);
    }
  }

  async function saveSettings(event, fieldsToSave, setMessage) {
    event.preventDefault();
    setMessage('Guardando…');
    const submittedSettings = Object.fromEntries(fieldsToSave.map(field => [field.key, settings[field.key] ?? field.defaultValue ?? '']));
    try {
      const response = await fetch(`/api/editor/${token}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: submittedSettings })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudieron guardar los cambios.');
      setMessage('Cambios guardados.');
    } catch (error) {
      setMessage(error.message || 'Error al guardar.');
    }
  }

  async function uploadMediaInternal(slot, file) {
    const type = slot.type === 'music' ? 'music' : slot.type;
    const number = slot.type === 'music' ? 0 : slot.number;
    const key = slotKey(type, number);
    if (file.size > MAX_FILE_SIZE) {
      setMessages(current => ({ ...current, [key]: 'El archivo supera el límite de 50 MB.' }));
      return false;
    }

    setMessages(current => ({ ...current, [key]: 'Preparando la carga…' }));
    try {
      const prepareResponse = await fetch(`/api/editor/${token}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'prepare',
          slotType: type,
          slotNumber: number,
          contentType: file.type,
          fileSize: file.size
        })
      });
      const upload = await prepareResponse.json();
      if (!prepareResponse.ok) throw new Error(upload.error || 'No se pudo preparar la carga.');

      setMessages(current => ({ ...current, [key]: 'Subiendo archivo…' }));
      const { error: uploadError } = await getBrowserSupabase()
        .storage.from('calendar-media')
        .uploadToSignedUrl(upload.path, upload.token, file, { contentType: file.type, cacheControl: '3600' });
      if (uploadError) throw new Error('No se pudo subir el archivo a Supabase.');

      const completeResponse = await fetch(`/api/editor/${token}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          slotType: type,
          slotNumber: number,
          contentType: file.type,
          path: upload.path,
          caption: captions[key] || ''
        })
      });
      const result = await completeResponse.json();
      if (!completeResponse.ok) throw new Error(result.error || 'No se pudo vincular el archivo.');
      setSavedMedia(current => ({ ...current, [key]: result.media }));
      if (type === 'gift') {
        setSettings(current => {
          const giftGames = { ...(current.giftGames || {}) };
          delete giftGames[number];
          return { ...current, giftGames };
        });
      }
      setMessages(current => ({ ...current, [key]: 'Guardado' }));
      return true;
    } catch (error) {
      setMessages(current => ({ ...current, [key]: error.message || 'Error al subir el archivo.' }));
      return false;
    }
  }

  async function uploadMedia(slot, file) {
    return withBusy('Subiendo archivo…', () => uploadMediaInternal(slot, file));
  }

  function chooseUpload(slot, accept) {
    pendingUploadRef.current = slot;
    if (!uploadInputRef.current) return;
    uploadInputRef.current.accept = accept;
    uploadInputRef.current.click();
  }

  async function runGameAction(action) {
    if (gameBusyRef.current) return;
    gameBusyRef.current = true;
    setGameBusy(true);
    try {
      await action();
    } finally {
      gameBusyRef.current = false;
      setGameBusy(false);
    }
  }

  async function setGiftGame(slot, game) {
    const key = slotKey(slot.type, slot.number);
    setMessages(current => ({ ...current, [key]: 'Guardando el juego…' }));
    try {
      const response = await fetch(`/api/editor/${token}/media`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set-gift-game', slotNumber: slot.number, game })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo guardar el juego.');
      if (game) {
        setSavedMedia(current => {
          const next = { ...current };
          delete next[key];
          return next;
        });
        setCaptions(current => ({ ...current, [key]: '' }));
      }
      setSettings(current => {
        const giftGames = { ...(current.giftGames || {}) };
        if (game) giftGames[slot.number] = game;
        else delete giftGames[slot.number];
        return { ...current, giftGames };
      });
      setMessages(current => ({ ...current, [key]: 'Juego guardado' }));
      setActiveGiftSlot(null);
    } catch (error) {
      setMessages(current => ({ ...current, [key]: error.message || 'Error al guardar el juego.' }));
    }
  }

  async function saveCaptionInternal(slot) {
    const key = slotKey(slot.type, slot.number);
    setMessages(current => ({ ...current, [key]: 'Guardando el texto…' }));
    try {
      const response = await fetch(`/api/editor/${token}/media`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotType: slot.type, slotNumber: slot.number, caption: captions[key] || '' })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo guardar el texto.');
      setSavedMedia(current => ({ ...current, [key]: { ...current[key], caption: captions[key] || '' } }));
      setMessages(current => ({ ...current, [key]: 'Texto guardado' }));
    } catch (error) {
      setMessages(current => ({ ...current, [key]: error.message || 'Error al guardar el texto.' }));
    }
  }

  async function saveCaption(slot) {
    return withBusy('Guardando el texto…', () => saveCaptionInternal(slot));
  }

  async function moveCoverInternal(slotNumber, direction) {
    const currentIndex = coverOrder.indexOf(slotNumber);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= coverOrder.length) return;

    const order = [...coverOrder];
    [order[currentIndex], order[nextIndex]] = [order[nextIndex], order[currentIndex]];
    setMessages(current => ({ ...current, 'cover-order': 'Guardando el orden…' }));
    try {
      const response = await fetch(`/api/editor/${token}/media`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder-covers', order })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo guardar el orden.');
      setCoverOrder(result.order);
      setMessages(current => ({ ...current, 'cover-order': 'Orden guardado' }));
    } catch (error) {
      setMessages(current => ({ ...current, 'cover-order': error.message || 'Error al guardar el orden.' }));
    }
  }

  async function moveCover(slotNumber, direction) {
    return withBusy('Guardando el orden…', () => moveCoverInternal(slotNumber, direction));
  }

  async function removePhotoInternal(slot) {
    const key = slotKey(slot.type, slot.number);
    setMessages(current => ({ ...current, [key]: 'Eliminando…' }));
    try {
      const response = await fetch(`/api/editor/${token}/media`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotType: slot.type, slotNumber: slot.number })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo eliminar la foto.');
      setSavedMedia(current => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      setMessages(current => ({ ...current, [key]: 'Eliminado' }));
    } catch (error) {
      setMessages(current => ({ ...current, [key]: error.message || 'Error al eliminar.' }));
    }
  }

  async function removePhoto(slot) {
    return withBusy('Eliminando…', () => removePhotoInternal(slot));
  }

  function shuffledDoorOrder() {
    const order = Array.from({ length: 24 }, (_, index) => index + 1);
    for (let index = order.length - 1; index > 0; index -= 1) {
      const other = Math.floor(Math.random() * (index + 1));
      [order[index], order[other]] = [order[other], order[index]];
    }
    return order;
  }

  async function saveDoorOrder(order) {
    return withBusy('Guardando el orden…', async () => {
      setMessages(current => ({ ...current, 'door-order': 'Guardando…' }));
      try {
        const response = await fetch(`/api/editor/${token}/settings`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings: { doorOrder: order } })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'No se pudo guardar el orden.');
        setDoorOrder(order);
        setMessages(current => ({ ...current, 'door-order': 'Guardado' }));
      } catch (error) {
        setMessages(current => ({ ...current, 'door-order': error.message || 'Error al guardar.' }));
      }
    });
  }

  function renderSlot(slot, coverPosition = null) {
    const key = slotKey(slot.type, slot.number);
    const item = savedMedia[key];
    return <article className="photo-slot" id={`slot-${key}`} key={key}>
      <div className="photo-slot-heading">
        <h2>{slot.label}</h2>
        {coverPosition !== null && <div className="cover-order-controls">
          <button className="cover-order-button" type="button" aria-label={`Mover ${slot.label} hacia adelante`} title="Mover hacia adelante" disabled={coverPosition === 0} onClick={() => moveCover(slot.number, -1)}>↑</button>
          <button className="cover-order-button" type="button" aria-label={`Mover ${slot.label} hacia atrás`} title="Mover hacia atrás" disabled={coverPosition === coverOrder.length - 1} onClick={() => moveCover(slot.number, 1)}>↓</button>
        </div>}
      </div>
      <div className={`photo-slot-preview${item ? '' : ' is-empty'}`}>
        {!item && !settings.giftGames?.[slot.number] && <span>Aún no hay contenido</span>}
        {item?.media_type === 'video' && <video src={item.url} muted controls playsInline />}
        {item?.media_type === 'image' && <img src={item.url} alt={slot.label} />}
        {item?.media_type === 'audio' && <audio src={item.url} controls />}
        {!item && slot.type === 'gift' && settings.giftGames?.[slot.number] && <span>{calendarGames.find(game => game.id === settings.giftGames[slot.number])?.label || 'Juego'}</span>}
      </div>
      {slot.type === 'gift'
        ? <button className="photo-upload-button" type="button" onClick={() => { setShowGiftGames(false); setImageGame(null); setActiveGiftSlot(slot); }}>{item || settings.giftGames?.[slot.number] ? 'Cambiar contenido' : 'Añadir contenido'}</button>
        : <label className="photo-upload-button">
          {item ? 'Cambiar foto' : 'Subir foto'}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={event => {
            const file = event.target.files?.[0];
            if (file) uploadMedia(slot, file);
            event.target.value = '';
          }} />
        </label>}
      {slot.type === 'gift' && <>
        <label className="caption-field">Texto debajo del contenido
          <textarea
            rows="3"
            maxLength="500"
            value={captions[key] || ''}
            onChange={event => setCaptions(current => ({ ...current, [key]: event.target.value }))}
          />
        </label>
        <button className="caption-save-button" type="button" disabled={!item} onClick={() => saveCaption(slot)}>Guardar texto</button>
      </>}
      {item && <button className="photo-remove-button" type="button" onClick={() => removePhoto(slot)}>Eliminar</button>}
      <p className="photo-slot-message" aria-live="polite">{messages[key] || '\u00a0'}</p>
    </article>;
  }

  return <div className="editor-layout"><div className="photo-editor">
    <button className="preview-toggle" type="button" aria-expanded={previewOpen} onClick={() => setPreviewOpen(current => !current)}>👁 Vista previa</button>
    {previewOpen && <div className="preview-overlay" role="dialog" aria-modal="false" aria-label="Vista previa">
      <button className="preview-close" type="button" aria-label="Cerrar vista previa" onClick={() => setPreviewOpen(false)}>×</button>
      <p className="preview-note">Vista previa · toca un elemento</p>
      <CalendarThumbnail design={design} settings={settings} coverPhotos={coverPhotos} coverOrder={coverOrder} gifts={previewGifts} activeTarget={previewTarget} onSelectTarget={selectPreviewTarget} />
    </div>}
    <form className="settings-form" onFocus={event => event.target.name && setPreviewTarget(event.target.name)} onSubmit={event => withBusy('Guardando textos…', () => saveSettings(event, textFields, setSettingsMessage))}>
      <section className="photo-group" aria-labelledby="settings-heading">
        <h2 id="settings-heading">Campos de {designLabel}</h2>
        <div className="settings-grid">{textFields.map(renderSettingField)}</div>
        <div className="settings-save-row"><button type="submit">Guardar textos</button><p aria-live="polite">{settingsMessage}</p></div>
        <section className="cover-photo-section" aria-labelledby="cover-heading">
          <h3 id="cover-heading">Fotos de portada <span>5</span></h3>
          <div className="photo-grid photo-grid-covers">{coverOrder.map((number, index) => {
            const slot = photoSlots.find(item => item.type === 'cover' && item.number === number);
            return slot ? renderSlot(slot, index) : null;
          })}</div>
          <p className="photo-slot-message" aria-live="polite">{messages['cover-order'] || 'Usa ↑ y ↓ para ordenar las fotos'}</p>
        </section>
      </section>
    </form>
    <form className="settings-form games-form" onFocus={event => event.target.name && setPreviewTarget(event.target.name)} onSubmit={event => withBusy('Guardando las tarjetas para rascar…', () => saveSettings(event, scratchFields, setGamesMessage))}>
      <section className="photo-group games-section" aria-labelledby="games-heading">
        <h2 id="games-heading">Tarjetas para rascar</h2>
        {scratchToggle && renderSettingField(scratchToggle)}
        <div className="settings-grid games-scratch-grid">{scratchDetailFields.map(renderSettingField)}</div>
        <div className="settings-save-row"><button type="submit">Guardar tarjetas</button><p aria-live="polite">{gamesMessage}</p></div>
      </section>
    </form>
    <section className="photo-group" aria-labelledby="music-heading">
      <h2 id="music-heading">Música del calendario</h2>
      {savedMedia[slotKey('music', 0)] && <audio controls src={savedMedia[slotKey('music', 0)].url} />}
      <label className="photo-upload-button music-upload">
        {savedMedia[slotKey('music', 0)] ? 'Cambiar música' : 'Elegir música'}
        <input type="file" accept="audio/mpeg,audio/mp4,audio/aac,audio/ogg,audio/wav,audio/x-wav" onChange={event => {
          const file = event.target.files?.[0];
          if (file) uploadMedia({ type: 'music', number: 0, label: 'Música' }, file);
          event.target.value = '';
        }} />
      </label>
      {savedMedia[slotKey('music', 0)] && <button className="photo-remove-button music-remove" type="button" onClick={() => removePhoto({ type: 'music', number: 0 })}>Eliminar música</button>}
      <p className="photo-slot-message" aria-live="polite">{messages[slotKey('music', 0)] || 'Audio MP3, WAV, OGG, AAC o M4A · máximo 50 MB'}</p>
    </section>
    <section className="photo-group" aria-labelledby="gift-heading">
      <h2 id="gift-heading">Contenido de las puertas <span>24</span></h2>
      <p className="photo-slot-message">Elige una imagen, un video, un audio o un juego para cada puerta.</p>
      <div className="door-shuffle-row">
        <label className="door-shuffle-toggle"><input type="checkbox" checked={Boolean(doorOrder)} onChange={event => saveDoorOrder(event.target.checked ? shuffledDoorOrder() : null)} />Mezclar las puertas</label>
        {doorOrder && <button className="door-shuffle-again" type="button" onClick={() => saveDoorOrder(shuffledDoorOrder())}>Volver a mezclar</button>}
        <p className="photo-slot-message" aria-live="polite">{messages['door-order'] || (doorOrder ? 'Las puertas aparecerán en orden aleatorio.' : 'Orden predeterminado: del 01 al 24.')}</p>
      </div>
      <div className="photo-grid">{photoSlots.slice(5).map(slot => renderSlot(slot))}</div>
    </section>
    {activeGiftSlot && <div className="editor-dialog-backdrop" role="presentation" onKeyDown={event => { if (event.key === 'Escape') setActiveGiftSlot(null); }} onMouseDown={event => { if (event.target === event.currentTarget) setActiveGiftSlot(null); }}>
      <section className="editor-dialog" role="dialog" aria-modal="true" aria-labelledby="gift-dialog-heading">
        <button className="editor-dialog-close" type="button" aria-label="Cerrar" onClick={() => setActiveGiftSlot(null)}>×</button>
        <p className="eyebrow">Puerta {String(activeGiftSlot.number).padStart(2, '0')}</p>
        <h2 id="gift-dialog-heading">{showGiftGames ? (imageGame ? `${imageGame.label}: elige una imagen` : 'Elegir un juego') : 'Elegir contenido'}</h2>
        {!showGiftGames ? <div className="gift-content-options">
          <button type="button" autoFocus onClick={() => chooseUpload(activeGiftSlot, 'image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/quicktime,video/webm')}>Elegir foto o video</button>
          <button type="button" onClick={() => chooseUpload(activeGiftSlot, 'audio/aac,audio/mp4,audio/mpeg,audio/ogg,audio/wav,audio/x-wav,audio/webm')}>Elegir audio</button>
          <button type="button" className="gift-games-button" onClick={() => setShowGiftGames(true)}>JUEGOS</button>
        </div> : imageGame ? <div className={`gift-game-options${gameBusy ? ' is-busy' : ''}`} aria-busy={gameBusy}>
          <button type="button" autoFocus onClick={() => runGameAction(async () => {
            if (savedMedia[slotKey('puzzle', 0)]) await removePhoto({ type: 'puzzle', number: 0 });
            await setGiftGame(activeGiftSlot, imageGame.id);
          })}>Imagen navideña (predeterminada)</button>
          <label className="photo-upload-button gift-puzzle-image">
            {savedMedia[slotKey('puzzle', 0)] ? 'Elegir otra foto propia' : 'Elegir una foto propia'}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={gameBusy} onChange={event => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) runGameAction(async () => {
                if (await uploadMedia({ type: 'puzzle', number: 0, label: 'Puzzle' }, file)) await setGiftGame(activeGiftSlot, imageGame.id);
              });
            }} />
          </label>
          {savedMedia[slotKey('puzzle', 0)] && <button type="button" onClick={() => runGameAction(() => setGiftGame(activeGiftSlot, imageGame.id))}>Usar la foto propia actual</button>}
          {gameBusy && <p className="gift-game-loader" role="status"><span className="gift-spinner" aria-hidden="true" />Guardando…</p>}
          <p className="photo-slot-message gift-puzzle-image" aria-live="polite">{messages[slotKey('puzzle', 0)] || ' '}</p>
          <button type="button" className="gift-games-back" onClick={() => setImageGame(null)}>Volver</button>
        </div> : <div className={`gift-game-options${gameBusy ? ' is-busy' : ''}`} aria-busy={gameBusy}>
          <div className="gift-game-cards">
            {calendarGames.map(game => {
              const doors = Object.entries(settings.giftGames || {}).filter(([, id]) => id === game.id).map(([number]) => Number(number)).sort((a, b) => a - b);
              const selected = settings.giftGames?.[activeGiftSlot.number] === game.id;
              return <button key={game.id} type="button" className={`gift-game-card${selected ? ' is-selected' : ''}`} aria-pressed={selected} onClick={() => (game.imageUpload ? setImageGame(game) : runGameAction(() => setGiftGame(activeGiftSlot, game.id)))}>
                <span className="gift-game-icon" aria-hidden="true">{game.icon}</span>
                <span className="gift-game-info">
                  <span className="gift-game-title">{game.label}{selected && <em className="gift-game-current">✓ Actual</em>}</span>
                  <span className="gift-game-desc">{game.description}</span>
                  <span className="gift-game-tags">{game.tags.map(tag => <span key={tag}>{tag}</span>)}</span>
                  {doors.length > 0 && <span className="gift-game-doors">En la puerta {doors.map(number => String(number).padStart(2, '0')).join(', ')}</span>}
                </span>
              </button>;
            })}
          </div>
          {settings.giftGames?.[activeGiftSlot.number] && <button type="button" onClick={() => runGameAction(() => setGiftGame(activeGiftSlot, null))}>Quitar juego</button>}
          {gameBusy && <p className="gift-game-loader" role="status"><span className="gift-spinner" aria-hidden="true" />Guardando…</p>}
          <button type="button" className="gift-games-back" onClick={() => setShowGiftGames(false)}>Volver</button>
        </div>}
        <button className="photo-remove-button" type="button" disabled={!savedMedia[slotKey('gift', activeGiftSlot.number)]} onClick={() => removePhoto(activeGiftSlot)}>Eliminar contenido</button>
        <p className="photo-slot-message" aria-live="polite">{messages[slotKey('gift', activeGiftSlot.number)] || '\u00a0'}</p>
        <input ref={uploadInputRef} className="visually-hidden" type="file" onChange={event => {
          const file = event.target.files?.[0];
          const slot = pendingUploadRef.current;
          if (file && slot) uploadMedia(slot, file);
          pendingUploadRef.current = null;
          event.target.value = '';
          setActiveGiftSlot(null);
        }} />
      </section>
    </div>}
    {busyAction && <div className="editor-busy" role="status" aria-live="polite"><span className="gift-spinner" aria-hidden="true" /><span>{busyAction}</span></div>}
  </div></div>;
}
