'use client';
import { useEffect, useRef, useState } from 'react';
import { Crosshair, Minus, Plus } from 'lucide-react';
import type { WorldSnapshot } from '../simulation/types';
import { canvasTransform, displayPosition, drawWorld, type Camera, type RenderOptions, type ViewMode } from '../rendering/canvas';
import type { Language } from '../experiments/catalog';

interface Props { snapshot: WorldSnapshot; language: Language; view: ViewMode; playing: boolean; selected: number | null; follow: boolean; debug: boolean; onSelect: (id: number) => void; compact?: boolean }
export function WorldCanvas(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null), frameRef = useRef(0);
  const data = useRef({ current: props.snapshot, previous: null as WorldSnapshot | null, time: 0 });
  const cameraRef = useRef<Camera>({ zoom: 1, x: 0, y: 0 });
  const optionsRef = useRef(props); const [zoom, setZoom] = useState(1); const [fps, setFps] = useState(0);
  const artRef = useRef<HTMLImageElement | null>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  useEffect(() => { optionsRef.current = props; }, [props]);
  useEffect(() => { data.current = { current: props.snapshot, previous: data.current.current, time: performance.now() }; }, [props.snapshot]);
  useEffect(() => { cameraRef.current = { zoom: 1, x: 0, y: 0 }; setZoom(1); }, [props.view]);
  useEffect(() => {
    const img = new Image(); img.src = '/art/meadows-paper.png'; img.onload = () => { artRef.current = img; };
    const canvas = canvasRef.current, ctx = canvas?.getContext('2d'); if (!canvas || !ctx) return;
    let width = 0, height = 0, count = 0, last = performance.now();
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width; height = entry.contentRect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }); resize.observe(canvas);
    const render = (now: number) => {
      const p = optionsRef.current;
      if (width && height) drawWorld(ctx, width, height, data.current.current, data.current.previous,
        p.playing ? Math.min(1, (now - data.current.time) / 100) : 1,
        { view: p.view, camera: cameraRef.current, selected: p.selected, follow: p.follow, debug: p.debug, language: p.language, art: artRef.current });
      count++; if (now - last > 1500) { setFps(Math.round(count * 1000 / (now - last))); count = 0; last = now; }
      frameRef.current = requestAnimationFrame(render);
    }; frameRef.current = requestAnimationFrame(render);
    return () => { resize.disconnect(); cancelAnimationFrame(frameRef.current); img.onload = null; };
  }, []);
  const options = (): RenderOptions => ({ view: props.view, camera: cameraRef.current, selected: props.selected, follow: props.follow, debug: props.debug, language: props.language, art: artRef.current });
  const changeZoom = (next: number) => { cameraRef.current.zoom = Math.min(3, Math.max(0.75, next)); setZoom(cameraRef.current.zoom); };
  const clickBee = (clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const tr = canvasTransform(rect.width, rect.height, options(), props.snapshot);
    const x = (clientX - rect.left - tr.tx) / tr.scale, y = (clientY - rect.top - tr.ty) / tr.scale;
    let closest: number | null = null, best = 22 / tr.scale;
    for (const bee of props.snapshot.bees) {
      const p = displayPosition(bee, props.view); if (!p) continue; const d = Math.hypot(p.x - x, p.y - y);
      if (d < best) { closest = bee.id; best = d; }
    } if (closest !== null) props.onSelect(closest);
  };
  return <div className={`world-canvas ${props.compact ? 'compact' : ''}`}>
    <canvas ref={canvasRef} aria-label={props.language === 'tr' ? 'Canlı koloni. Arı seçimi için Arıyı incele kontrolünü de kullanabilirsiniz.' : 'Live colony. Use Inspect a bee for keyboard-accessible selection.'}
      onPointerDown={e => { drag.current = { x: e.clientX, y: e.clientY, moved: false }; e.currentTarget.setPointerCapture(e.pointerId); }}
      onPointerMove={e => { const d = drag.current; if (!d) return; const dx = e.clientX - d.x, dy = e.clientY - d.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) { d.moved = true; if (cameraRef.current.zoom > 1) {
          const r = e.currentTarget.getBoundingClientRect(); const tr = canvasTransform(r.width, r.height, options(), props.snapshot);
          cameraRef.current.x -= dx / tr.scale; cameraRef.current.y -= dy / tr.scale;
        } d.x = e.clientX; d.y = e.clientY; } }}
      onPointerUp={e => { if (drag.current && !drag.current.moved) clickBee(e.clientX, e.clientY); drag.current = null; }}
      onPointerCancel={() => { drag.current = null; }} />
    <div className="canvas-status"><span className={props.playing ? 'live-dot' : 'paused-dot'} />{props.language === 'tr' ? (props.playing ? 'Çalışıyor' : 'Duraklatıldı') : (props.playing ? 'Running' : 'Paused')}</div>
    <div className="camera-tools">
      <button aria-label={props.language === 'tr' ? 'Yakınlaştır' : 'Zoom in'} onClick={() => changeZoom(zoom + 0.25)}><Plus size={17} /></button>
      <button aria-label={props.language === 'tr' ? 'Uzaklaştır' : 'Zoom out'} onClick={() => changeZoom(zoom - 0.25)}><Minus size={17} /></button>
      <button aria-label={props.language === 'tr' ? 'Kamerayı sıfırla' : 'Reset camera'} onClick={() => { cameraRef.current = { zoom: 1, x: 0, y: 0 }; setZoom(1); }}><Crosshair size={17} /></button>
    </div>
    <div className="canvas-scale"><span />{props.view === 'landscape' ? (props.language === 'tr' ? 'Model uzayı' : 'Model space') : (props.language === 'tr' ? 'Kovan içi · 8×' : 'Inside hive · 8×')} · {zoom.toFixed(2)}×</div>
    {props.debug && <div className="render-stats">{fps} FPS · {props.snapshot.bees.length} {props.language === 'tr' ? 'arı' : 'bees'}</div>}
  </div>;
}
