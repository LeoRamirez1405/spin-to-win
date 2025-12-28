import React, { useEffect, useState, useRef } from 'react';
import './TypingReveal.css';

export default function TypingReveal({ tipo, texto, velocidad = 40, onComplete }) {
  const [displayed, setDisplayed] = useState('');
  const idxRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setDisplayed('');
    idxRef.current = 0;
    if (!texto) return;

    function tick() {
      setDisplayed(texto.slice(0, idxRef.current + 1));
      idxRef.current += 1;
      if (idxRef.current < texto.length) {
        timerRef.current = setTimeout(tick, velocidad);
      } else {
        timerRef.current = setTimeout(() => {
          if (onComplete) onComplete();
        }, 300);
      }
    }

    setDisplayed(texto.slice(0, 1));
    idxRef.current = 1;
    if (texto.length > 1) {
      timerRef.current = setTimeout(tick, velocidad);
    } else {
      timerRef.current = setTimeout(() => { if (onComplete) onComplete(); }, 300);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [texto, velocidad]);

  return (
    <div className="typing-reveal">
      <div className="typing-reveal-tipo">{tipo ? tipo.toUpperCase() : ''}</div>
      <div className="typing-reveal-texto">{displayed}<span className="cursor">|</span></div>
    </div>
  );
}
