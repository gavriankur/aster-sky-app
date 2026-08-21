"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const objects = [
  { name: "Saturn", type: "Planet", meta: "1.34 billion km", x: 68, y: 32, color: "#f3c785", size: 10 },
  { name: "Vega", type: "Star", meta: "25 light-years", x: 25, y: 22, color: "#d8eaff", size: 5 },
  { name: "Altair", type: "Star", meta: "16.7 light-years", x: 38, y: 57, color: "#edf4ff", size: 4 },
  { name: "Deneb", type: "Star", meta: "2,600 light-years", x: 16, y: 46, color: "#b8d9ff", size: 4 },
  { name: "Arcturus", type: "Star", meta: "36.7 light-years", x: 82, y: 66, color: "#ffb06d", size: 6 },
  { name: "Mars", type: "Planet", meta: "225 million km", x: 58, y: 74, color: "#ff7d5c", size: 7 },
];

const constellationLines = [[25,22,38,57],[25,22,16,46],[38,57,16,46],[68,32,82,66],[58,74,82,66]];

export default function Home() {
  const [selected, setSelected] = useState(objects[0]);
  const [nightMode, setNightMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [motion, setMotion] = useState({ x: 0, y: 0 });
  const [tracking, setTracking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filtered = useMemo(() => objects.filter(o => o.name.toLowerCase().includes(query.toLowerCase())), [query]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    let animationId = 0;
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < 170; i++) {
        const x = ((i * 83 + 2417) % 997) / 997 * w;
        const y = ((i * i * 29 + 2417) % 991) / 991 * h;
        const pulse = .45 + .4 * Math.sin(frame / 38 + i);
        ctx.beginPath(); ctx.arc(x, y, i % 17 === 0 ? 1.4 : .55, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(225,239,255,${pulse})`; ctx.fill();
      }
      frame++;
      animationId = requestAnimationFrame(draw);
    };
    animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, []);

  async function enableCompass() {
    const orientation = DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };
    if (orientation.requestPermission && await orientation.requestPermission() !== "granted") return;
    window.addEventListener("deviceorientation", event => {
      setMotion({ x: Math.max(-14, Math.min(14, (event.gamma || 0) / 3)), y: Math.max(-10, Math.min(10, (event.beta || 0) / 6)) });
    });
    setTracking(true);
  }

  return (
    <main className={nightMode ? "app night" : "app"}>
      <canvas ref={canvasRef} className="starfield" aria-hidden="true" />
      <div className="aurora" aria-hidden="true" />
      <section className="sky" style={{ transform: `translate3d(${motion.x}px, ${motion.y}px, 0)` }} aria-label="Interactive sky map">
        <div className="horizon" />
        {constellationLines.map((line, i) => <i key={i} className="constellation-line" style={{ left: `${line[0]}%`, top: `${line[1]}%`, width: `${Math.hypot(line[2]-line[0],line[3]-line[1]).toFixed(3)}%`, transform: `rotate(${(Math.atan2(line[3]-line[1],line[2]-line[0]) * 180 / Math.PI).toFixed(3)}deg)` }} />)}
        {objects.map(object => (
          <button key={object.name} className={`celestial ${selected.name === object.name ? "active" : ""}`} style={{ left: `${object.x}%`, top: `${object.y}%`, "--object-color": object.color, "--object-size": `${object.size}px` } as React.CSSProperties} onClick={() => setSelected(object)} aria-label={`Select ${object.name}`}>
            <span className="orb" /><span className="object-label">{object.name}</span>
          </button>
        ))}
      </section>
      <header className="topbar">
        <div className="brand"><span className="brand-mark">✦</span><span>Aster</span></div>
        <div className="top-actions"><button className="round-button" onClick={() => setNightMode(!nightMode)} aria-label="Toggle night mode">{nightMode ? "☼" : "◐"}</button><button className="round-button" onClick={() => setSearchOpen(true)} aria-label="Search the sky">⌕</button></div>
      </header>
      <div className="compass"><span>W</span><span className="tick" /><strong>285°</strong><span className="tick" /><span>NW</span></div>
      <aside className="object-card">
        <div className="object-art" style={{ "--object-color": selected.color } as React.CSSProperties}><span /></div>
        <div className="object-copy"><small>{selected.type}</small><h1>{selected.name}</h1><p>{selected.meta} away</p></div>
        <button className="more-button" aria-label={`More information about ${selected.name}`}>↗</button>
      </aside>
      <nav className="bottom-nav" aria-label="Main navigation">
        <button className="nav-item active"><span>✦</span><small>Sky</small></button><button className="nav-item"><span>◷</span><small>Tonight</small></button><button className={`locate ${tracking ? "tracking" : ""}`} onClick={enableCompass} aria-label="Use phone orientation"><span>⌖</span></button><button className="nav-item"><span>◎</span><small>Explore</small></button><button className="nav-item"><span>≡</span><small>More</small></button>
      </nav>
      {searchOpen && <div className="search-sheet" role="dialog" aria-modal="true" aria-label="Search celestial objects"><div className="sheet-handle" /><div className="search-row"><span>⌕</span><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search planets, stars…" /><button onClick={() => setSearchOpen(false)}>Done</button></div><div className="results">{filtered.map(object => <button key={object.name} onClick={() => { setSelected(object); setSearchOpen(false); setQuery(""); }}><span className="result-dot" style={{ background: object.color }} /><span><strong>{object.name}</strong><small>{object.type} · {object.meta}</small></span><b>›</b></button>)}</div></div>}
    </main>
  );
}
