'use client';

import { useEffect, useRef } from 'react';

export default function CalendarThumbnail({ design, settings, coverPhotos, coverOrder, gifts, activeTarget, onSelectTarget }) {
  const screenRef = useRef(null);
  const titleLines = String(settings.title || '').split('\n');
  const shownCover = activeTarget.startsWith('cover-') ? Number(activeTarget.slice(6)) : coverOrder[0];

  useEffect(() => {
    const screen = screenRef.current;
    const highlighted = screen?.querySelector('.is-highlighted');
    if (!highlighted) return;
    const offset = highlighted.getBoundingClientRect().top - screen.getBoundingClientRect().top + screen.scrollTop;
    screen.scrollTo({ top: offset - screen.clientHeight / 3, behavior: 'smooth' });
  }, [activeTarget]);

  function target(name, className) {
    return {
      className: `${className} thumb-target${activeTarget === name ? ' is-highlighted' : ''}`,
      role: 'button',
      tabIndex: 0,
      onClick: () => onSelectTarget(name),
      onKeyDown: event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onSelectTarget(name);
      }
    };
  }

  return <div className={`phone-frame ${design}`}>
    <div className="phone-notch" aria-hidden="true" />
    <div className={`calendar-thumbnail ${design}`} ref={screenRef}>
      <span className="thumbnail-month">Diciembre · 2026</span>
      <span {...target('title', 'thumbnail-title')}>{titleLines.map((line, index) => <span key={`${line}-${index}`}>{line || '\u00a0'}</span>)}</span>
      <span {...target('introText', 'thumbnail-intro')}>{settings.introText}</span>
      <span {...target(`cover-${shownCover}`, 'thumbnail-photo')}>
        {coverPhotos[shownCover] ? <img src={coverPhotos[shownCover]} alt={`Foto de portada ${shownCover}`} /> : <span>Añadir foto de portada</span>}
      </span>
      <span className="thumbnail-photo-dots" aria-hidden="true">{coverOrder.map(number => <span className={`${coverPhotos[number] ? 'has-photo' : ''}${number === shownCover ? ' is-current' : ''}`} key={number} />)}</span>
      <span {...target('displayText', 'thumbnail-names')}>{settings.displayText}</span>

      <div className={`thumbnail-scratch${settings.scratchEnabled ? '' : ' is-off'}`}>
        <span {...target('scratchTitle', 'thumbnail-scratch-title')}>{settings.scratchTitle}</span>
        <span {...target('scratchHint', 'thumbnail-scratch-hint')}>{settings.scratchHint}</span>
        <span {...target('scratchCircles', 'thumbnail-scratch-circles')}>{[1, 2, 3].map(number => <span key={number}>{number}</span>)}</span>
        <span {...target('scratchEndText', 'thumbnail-scratch-end')}>{settings.scratchEndText}</span>
      </div>

      <div className="thumbnail-topbar">
        <span>Hoy puedes abrir una puerta</span>
        <span {...target('music', 'thumbnail-music')}>♫ Música</span>
      </div>

      <div className="thumbnail-doors">
        {gifts.map((gift, index) => <span {...target(`gift-${index + 1}`, `thumbnail-door${gift.hasContent ? ' has-content' : ''}`)} key={index}>{String(index + 1).padStart(2, '0')}</span>)}
      </div>
    </div>
  </div>;
}