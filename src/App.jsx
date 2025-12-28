import React, { useState, useEffect, useRef } from "react";
import './YouDied.css';
import "./App.css";
import TypingReveal from "./TypingReveal";
import { subscribeToGame, updateGameRemote, initFirebase } from './firebase';
// Import local JSON data
import retosJson from './data/retos.json';
import preguntasJson from './data/preguntas.json';

function App() {
  const [jugadores, setJugadores] = useState([]);
  const [nombre, setNombre] = useState("");
  const [nombres, setNombres] = useState([]);
  const [turno, setTurno] = useState(0);
  const [enJuego, setEnJuego] = useState(false);
  const [showYouDied, setShowYouDied] = useState(false);
  const [soloCentral, setSoloCentral] = useState(false);

  const buildInitialOptions = () => {
    const retos = (retosJson && retosJson.retos) ? retosJson.retos.map((t, i) => ({ texto: t, tipo: 'reto', id: `reto-${i}` })) : [];
    const preguntas = (preguntasJson && preguntasJson.preguntas) ? preguntasJson.preguntas.map((t, i) => ({ texto: t, tipo: 'pregunta', id: `preg-${i}` })) : [];
    const combined = [];
    const maxLen = Math.max(retos.length, preguntas.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < retos.length) combined.push(retos[i]);
      if (i < preguntas.length) combined.push(preguntas[i]);
    }
    if (combined.length === 0) {
      return Array.from({length: 20}, (_,i) => ({ texto: `Gira para empezar ${i+1}`, tipo: 'neutral', id: `init-${i}` }));
    }
    return combined;
  };

  const [opcionesRuleta, setOpcionesRuleta] = useState(buildInitialOptions);

  const [currentTipo, setCurrentTipo] = useState(null);
  const [currentTexto, setCurrentTexto] = useState('');
  const revealActiveRef = useRef(false);

  useEffect(() => {
    // initialize firebase if user filled config in src/firebase.js
    try { initFirebase(); } catch (e) { /* ignore if not configured */ }
    const unsub = subscribeToGame((data) => {
      if (!data) return;
      if (data.nombres) setNombres(data.nombres);
      if (data.jugadores) setJugadores(data.jugadores);
      if (data.opcionesRuleta) setOpcionesRuleta(data.opcionesRuleta);
      if (typeof data.turno !== 'undefined') setTurno(data.turno);
      if (typeof data.currentTipo !== 'undefined') setCurrentTipo(data.currentTipo);
      if (typeof data.currentTexto !== 'undefined') setCurrentTexto(data.currentTexto);
      if (typeof data.enJuego !== 'undefined') setEnJuego(data.enJuego);
      if (data.customItems) setCustomItems(data.customItems);
      if (typeof data.showYouDied !== 'undefined') setShowYouDied(data.showYouDied);
    });
    return () => unsub && unsub();
  }, []);

  const agregarNombre = () => {
    if (nombre.trim() && !nombres.includes(nombre.trim())) {
      const newNombres = [...nombres, nombre.trim()];
      setNombres(newNombres);
      setNombre("");
      updateGameRemote({ nombres: newNombres });
    }
  };

  const [customTipo, setCustomTipo] = useState('reto');
  const [customTexto, setCustomTexto] = useState('');
  const [customItems, setCustomItems] = useState([]);

  const agregarItem = () => {
    const texto = customTexto.trim();
    if (!texto) return;
    const nueva = { texto, tipo: customTipo, id: `custom-${Date.now()}-${Math.floor(Math.random()*1000)}` };
    const newCustom = [...customItems, nueva];
    const newOpc = [...opcionesRuleta, nueva];
    setCustomItems(newCustom);
    setOpcionesRuleta(newOpc);
    setCustomTexto('');
    updateGameRemote({ customItems: newCustom, opcionesRuleta: newOpc });
  };

  const eliminarItem = (id) => {
    const newCustom = customItems.filter(x => x.id !== id);
    const newOpc = opcionesRuleta.filter(x => x.id !== id);
    setCustomItems(newCustom);
    setOpcionesRuleta(newOpc);
    updateGameRemote({ customItems: newCustom, opcionesRuleta: newOpc });
  };

  const iniciarJuego = async () => {
    if (nombres.length >= 2) {
      setEnJuego(true);
      const newJug = nombres.map((n, i) => ({ nombre: n, vidas: 3, id: i }));
      setJugadores(newJug);
      setTurno(0);
      updateGameRemote({ enJuego: true, jugadores: newJug, turno: 0 });
    }
  };

  const advanceTurn = () => setTurno((t) => (t + 1) % jugadores.length);

  const pickOption = () => {
    if (!opcionesRuleta || opcionesRuleta.length === 0) return { texto: 'Nada disponible', tipo: 'neutral' };
    const idx = Math.floor(Math.random() * opcionesRuleta.length);
    return opcionesRuleta[idx];
  };

  const girar = () => {
    if (revealActiveRef.current) return;
    const opt = pickOption();
    setCurrentTipo(opt.tipo);
    setCurrentTexto(opt.texto);
    setSoloCentral(false);
    revealActiveRef.current = true;
    updateGameRemote({ currentTipo: opt.tipo, currentTexto: opt.texto });
  };

  const cumplido = () => {
    revealActiveRef.current = false;
    // advance turn and update remote
    setTurno((t) => {
      const nt = (t + 1) % jugadores.length;
      updateGameRemote({ turno: nt, currentTexto: '' });
      return nt;
    });
    setCurrentTexto('');
    setSoloCentral(false);
  };

  const noCumplido = () => {
    revealActiveRef.current = false;
    const newJug = jugadores.map((p, idx) => idx === turno ? { ...p, vidas: Math.max(0, p.vidas - 1) } : p);
    // determine if someone died
    let didDie = false;
    const curJugador = newJug[turno];
    if (curJugador && curJugador.vidas <= 0) didDie = true;
    const newTurn = (turno + 1) % (newJug.length || 1);
    setJugadores(newJug);
    setTurno(newTurn);
    if (didDie) {
      setShowYouDied(true);
      setEnJuego(false);
    }
    setCurrentTexto('');
    setSoloCentral(false);
    updateGameRemote({ jugadores: newJug, turno: newTurn, showYouDied: didDie, enJuego: !didDie });
  };

  if (showYouDied) {
    return (
      <div className="you-died-overlay" onClick={() => {
        setShowYouDied(false);
        setEnJuego(false);
        setNombres([]);
        setNombre("");
        setJugadores([]);
        setTurno(0);
      }}>
        <div className="you-died-text">YOU DIED</div>
        <div className="you-died-sub">Haz clic para reiniciar</div>
      </div>
    );
  }

  if (!enJuego) {
    return (
      <div className="container">
        <h1>Spin to Win</h1>
        <h2>Jugadores</h2>
        <ul>
          {nombres.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <div className="custom-items-section" style={{ marginTop: 12, textAlign: 'left' }}>
          <h3>Agregar retos / preguntas</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <select value={customTipo} onChange={(e) => setCustomTipo(e.target.value)}>
              <option value="reto">Reto</option>
              <option value="pregunta">Pregunta</option>
            </select>
            <input value={customTexto} onChange={(e) => setCustomTexto(e.target.value)} placeholder="Texto del reto/pregunta" style={{ flex: 1 }} />
            <button onClick={agregarItem}>Agregar pregunta</button>
          </div>
          {customItems.length > 0 && (
            <div className="custom-list">
              {customItems.map((c) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 6, background: '#fffef0', borderRadius: 8, marginBottom: 6 }}>
                  <div style={{ color: '#333' }}><strong>{c.tipo.toUpperCase()}</strong>: {c.texto}</div>
                  <button onClick={() => eliminarItem(c.id)} style={{ background: '#ff6b6b', color: '#fff', borderRadius: 8, padding: '6px 8px' }}>Eliminar</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="player-input" style={{ marginBottom: 16 }}>
          <input
            className="nombre-input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del jugador"
          />
          <button className="agregar-jugador-btn" onClick={agregarNombre}>
            Agregar jugador
          </button>
        </div>
        <button onClick={iniciarJuego} disabled={nombres.length < 2} style={{ marginTop: 8 }}>
          Iniciar juego
        </button>
      </div>
    );
  }

  const jugadorActual = jugadores[turno];

  return (
    <div className="container">
      <h1>Spin to Win</h1>
      <h2>Turno de {jugadorActual?.nombre}</h2>
      <div className="jugadores">
        {jugadores.map((j) => (
          <div key={j.id} className={j.id === turno ? "jugador actual" : "jugador"}>
            {j.nombre} <span className="vidas">❤️ {j.vidas}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 16 }}>
        {!currentTexto && (
          <>
            <div style={{ margin: 12, color: '#1a2340' }}>
              <em>Presiona Revelar para obtener un reto o pregunta</em>
            </div>
            <button className="girar-ruleta-btn" onClick={girar}>
              Revelar
            </button>
          </>
        )}
        {currentTexto && (
          <>
            <TypingReveal tipo={currentTipo} texto={currentTexto} onComplete={() => setSoloCentral(true)} />
            {soloCentral && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 16 }}>
                <button className="cumplido" onClick={() => { cumplido(); setCurrentTexto(''); setSoloCentral(false); }}>
                  ¡Lo cumplí!
                </button>
                <button className="no-cumplido" onClick={() => { noCumplido(); setCurrentTexto(''); setSoloCentral(false); }}>
                  No lo cumplí
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
