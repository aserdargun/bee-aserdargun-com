import { WORLD, type Bee, type Vec, type WorldSnapshot } from '../simulation/types';
export type ViewMode = 'landscape' | 'dance' | 'communication';
export interface Camera { zoom: number; x: number; y: number }
export const COLORS = { ink: '#29332f', sage: '#6e8874', amber: '#bd8638', blue: '#6e8caa', paper: '#f7f5ee', muted: '#738077' };
export interface RenderOptions { view: ViewMode; camera: Camera; selected: number | null; follow: boolean; debug: boolean; language: 'tr' | 'en'; art: HTMLImageElement | null }
const TAU = Math.PI * 2;
function line(ctx: CanvasRenderingContext2D, a: Vec, b: Vec) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
function hex(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath(); for (let j = 0; j < 6; j++) { const angle = Math.PI / 3 * j - Math.PI / 6; const px = x + Math.cos(angle) * r, py = y + Math.sin(angle) * r; if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.closePath();
}
function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); }
export function displayPosition(bee: Bee, view: ViewMode): Vec | null {
  if (view === 'landscape') return bee;
  if (!['Resting', 'Dancing', 'ObservingDance'].includes(bee.state)) return null;
  return { x: 500 + (bee.x - WORLD.hive.x) * 8, y: 350 + (bee.y - WORLD.hive.y) * 8 };
}
export function canvasTransform(width: number, height: number, options: RenderOptions, snapshot: WorldSnapshot) {
  const fit = Math.min(width / WORLD.width, height / WORLD.height), scale = fit * options.camera.zoom;
  const followed = options.follow ? snapshot.bees.find(b => b.id === options.selected) : undefined;
  const center = followed ? displayPosition(followed, options.view) : null;
  return { scale, tx: width / 2 - (center?.x ?? (WORLD.width / 2 + options.camera.x)) * scale,
    ty: height / 2 - (center?.y ?? (WORLD.height / 2 + options.camera.y)) * scale };
}
export function drawWorld(ctx: CanvasRenderingContext2D, width: number, height: number, snapshot: WorldSnapshot,
  previous: WorldSnapshot | null, blend: number, options: RenderOptions) {
  ctx.clearRect(0, 0, width, height); ctx.fillStyle = COLORS.paper; ctx.fillRect(0, 0, width, height);
  const { scale, tx, ty } = canvasTransform(width, height, options, snapshot);
  ctx.save(); ctx.translate(tx, ty); ctx.scale(scale, scale);
  if (options.view === 'landscape') drawLandscape(ctx, snapshot, options);
  else drawHiveFloor(ctx, snapshot, options);
  if (options.view === 'communication') drawCommunication(ctx, snapshot);
  for (const bee of snapshot.bees) {
    const p = displayPosition(bee, options.view); if (!p) continue;
    const previousBee = previous?.bees[bee.id - 1]; const last = previousBee ? displayPosition(previousBee, options.view) : null;
    const x = last ? last.x + (p.x - last.x) * blend : p.x, y = last ? last.y + (p.y - last.y) * blend : p.y;
    const localSize = options.view === 'landscape' ? Math.max(1, 0.75 / scale) : 1.8;
    if (options.view !== 'landscape' && bee.state === 'Dancing') {
      ctx.strokeStyle = '#bd863852'; ctx.lineWidth = 1.5; circle(ctx, x, y, 23); ctx.stroke();
      const signal = snapshot.signals.find(s => s.dancerId === bee.id);
      if (signal) { ctx.strokeStyle = COLORS.amber; line(ctx, { x, y }, { x: x + Math.cos(signal.direction) * 35, y: y + Math.sin(signal.direction) * 35 }); }
    }
    drawBee(ctx, x, y, bee, localSize, bee.id === options.selected, snapshot.tick);
    if (options.debug) {
      ctx.fillStyle = COLORS.ink; ctx.font = '10px monospace'; ctx.fillText(String(bee.id), x + 9, y - 5);
      if (bee.id === options.selected && options.view === 'landscape') {
        ctx.strokeStyle = '#6e8caa88'; ctx.setLineDash([4, 4]); circle(ctx, x, y, WORLD.sensorRadius); ctx.stroke();
        if (bee.target) line(ctx, { x, y }, bee.target); ctx.setLineDash([]);
      }
    }
  }
  if (options.view === 'landscape') {
    for (const patch of snapshot.patches) {
      const left = patch.id === 'A'; const y = patch.y + patch.radius + 75;
      ctx.fillStyle = '#faf9f5ee'; ctx.strokeStyle = '#d5d4c5'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(patch.x - 85, y - 20, 170, 50, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = COLORS.ink; ctx.font = '13px "DM Mono", monospace';
      ctx.fillText(`${patch.id} · ${options.language === 'tr' ? (left ? 'Yakın çayır' : 'Zengin çayır') : (left ? 'Near meadow' : 'Rich meadow')}`, patch.x - 74, y);
      ctx.fillStyle = patch.active ? (left ? COLORS.sage : COLORS.amber) : COLORS.muted;
      ctx.font = '12px "DM Mono", monospace';
      ctx.fillText(patch.active ? `${options.language === 'tr' ? 'Kalite' : 'Quality'} ${patch.quality.toFixed(2)}` : (options.language === 'tr' ? 'Kaynak kaldırıldı' : 'Source removed'), patch.x - 74, y + 18);
    }
  }
  ctx.restore();
}

function drawLandscape(ctx: CanvasRenderingContext2D, snapshot: WorldSnapshot, options: RenderOptions) {
  // Cartographic texture is illustrative only; it creates no obstacles or environmental knowledge.
  ctx.strokeStyle = '#dbddcc65'; ctx.lineWidth = 0.7;
  for (let i = -10; i < 35; i++) {
    ctx.beginPath();
    for (let x = 0; x <= 1000; x += 12) {
      const y = i * 31 + Math.sin(x / 86 + i * 0.42) * 15 + Math.sin(x / 220 + i) * 22;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    } ctx.stroke();
  }
  for (const patch of snapshot.patches) {
    ctx.save(); ctx.globalAlpha = patch.active ? 1 : 0.25;
    const color = patch.id === 'A' ? COLORS.sage : COLORS.amber;
    ctx.fillStyle = patch.id === 'A' ? '#6e887410' : '#bd863810'; circle(ctx, patch.x, patch.y, patch.radius + 22); ctx.fill();
    if (options.art?.complete && options.art.naturalWidth > 0) {
      const half = options.art.naturalWidth / 2, size = patch.id === 'A' ? 190 : 225;
      ctx.drawImage(options.art, patch.id === 'A' ? 0 : half, 0, half, options.art.naturalHeight,
        patch.x - size / 2, patch.y - size * 0.68, size, size);
    }
    ctx.setLineDash([2, 6]); ctx.strokeStyle = color + '70'; ctx.lineWidth = 1;
    circle(ctx, patch.x, patch.y, patch.radius); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  }
  for (const bee of snapshot.bees) {
    if (['Searching', 'FlyingToResource', 'Returning'].includes(bee.state)) {
      ctx.strokeStyle = bee.role === 'Scout' ? '#6e8caa55' : '#bd863848'; ctx.lineWidth = 1;
      line(ctx, bee, { x: bee.x - Math.cos(bee.heading) * 14, y: bee.y - Math.sin(bee.heading) * 14 });
    }
  }
  ctx.fillStyle = '#fcf9e9'; ctx.strokeStyle = '#dcc08b'; ctx.lineWidth = 1.5;
  circle(ctx, WORLD.hive.x, WORLD.hive.y, 49); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#bd863885'; circle(ctx, WORLD.hive.x, WORLD.hive.y, 44); ctx.stroke();
  for (let row = -2; row <= 2; row++) for (let col = -2; col <= 2; col++) {
    const x = WORLD.hive.x + col * 16 + (Math.abs(row) % 2) * 8, y = WORLD.hive.y + row * 14;
    if (Math.hypot(x - WORLD.hive.x, y - WORLD.hive.y) > 31) continue;
    hex(ctx, x, y, 8.5); ctx.fillStyle = '#e5bd65'; ctx.strokeStyle = '#a97c36'; ctx.lineWidth = 0.8; ctx.fill(); ctx.stroke();
  }
  ctx.fillStyle = COLORS.ink; ctx.font = '12px "DM Mono", monospace'; ctx.textAlign = 'center';
  ctx.fillText(options.language === 'tr' ? 'KOVAN' : 'HIVE', WORLD.hive.x, WORLD.hive.y + 67); ctx.textAlign = 'left';
}

function drawHiveFloor(ctx: CanvasRenderingContext2D, snapshot: WorldSnapshot, options: RenderOptions) {
  for (let row = 0; row < 18; row++) for (let col = 0; col < 24; col++) {
    hex(ctx, col * 47 + row % 2 * 23.5 - 20, row * 41 - 25, 27);
    ctx.strokeStyle = '#d8caa33b'; ctx.lineWidth = 0.8; ctx.stroke();
  }
  ctx.fillStyle = '#fffdf665'; circle(ctx, 500, 350, 255); ctx.fill();
  ctx.strokeStyle = '#cbbd994d'; ctx.lineWidth = 1; circle(ctx, 500, 350, 255); ctx.stroke();
  ctx.fillStyle = COLORS.muted; ctx.font = '14px "DM Sans", sans-serif'; ctx.textAlign = 'center';
  const caption = options.view === 'dance'
    ? (options.language === 'tr' ? 'Yönü ve mesafeyi incelemek için bir dansçıyı seçin.' : 'Select a dancer to inspect direction and distance.')
    : (options.language === 'tr' ? 'Çizgiler son katılımların bilgisini taşır.' : 'Links trace recent successful recruitment.');
  ctx.fillText(caption, 500, 635);
  if (!snapshot.signals.length) ctx.fillText(options.language === 'tr' ? 'Henüz dans yok. Başarılı bir dönüşü bekleyin.' : 'No dance yet. Wait for a successful return.', 500, 82);
  ctx.textAlign = 'left';
}

function drawCommunication(ctx: CanvasRenderingContext2D, snapshot: WorldSnapshot) {
  const recent = snapshot.events.filter(e => e.type === 'recruitment' && e.tick > snapshot.tick - 300).slice(-45);
  for (const event of recent) {
    const observer = snapshot.bees.find(b => b.id === event.beeId), dancer = snapshot.bees.find(b => b.id === event.otherBeeId);
    if (!observer || !dancer) continue;
    // Contacts occurred in the hive; the circular margin marks recipients now outside.
    const a = displayPosition(dancer, 'dance') ?? { x: 500 + Math.cos(dancer.id * 2.4) * 285, y: 350 + Math.sin(dancer.id * 2.4) * 285 };
    const b = displayPosition(observer, 'dance') ?? { x: 500 + Math.cos(observer.id * 2.4) * 285, y: 350 + Math.sin(observer.id * 2.4) * 285 };
    ctx.strokeStyle = event.patchId === 'A' ? '#6e887460' : '#bd863865'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(500, 350, b.x, b.y); ctx.stroke();
    ctx.fillStyle = event.patchId === 'A' ? COLORS.sage : COLORS.amber; circle(ctx, b.x, b.y, 3); ctx.fill();
  }
}

function drawBee(ctx: CanvasRenderingContext2D, x: number, y: number, bee: Bee, size: number, selected: boolean, tick: number) {
  if (selected) { ctx.strokeStyle = COLORS.blue; ctx.lineWidth = 1.7; circle(ctx, x, y, 13 * size); ctx.stroke(); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(bee.heading); ctx.scale(size, size);
  const inside = ['Resting', 'Dancing', 'ObservingDance'].includes(bee.state);
  ctx.globalAlpha = inside && size === 1 && !selected ? 0.42 : 0.95;
  const wing = inside ? 4 : 5 + Math.sin(tick * 1.7 + bee.id) * 0.8;
  ctx.fillStyle = '#fffefdcd'; ctx.strokeStyle = '#53605280'; ctx.lineWidth = 0.55;
  for (const side of [-1, 1]) { ctx.beginPath(); ctx.ellipse(-1, side * 3, 4.1, wing * 0.52, side * 0.45, 0, TAU); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = bee.role === 'Scout' ? '#c4a161' : '#ceaa5e';
  ctx.beginPath(); ctx.ellipse(-2, 0, 4, 2.25, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#433d2c'; ctx.lineWidth = 1.2;
  line(ctx, { x: -4, y: -1.5 }, { x: -4, y: 1.5 }); line(ctx, { x: -1.8, y: -2 }, { x: -1.8, y: 2 });
  ctx.fillStyle = '#353d31'; circle(ctx, 2, 0, 2); ctx.fill(); circle(ctx, 4.1, 0, 1.25); ctx.fill();
  if (bee.cargo > 0) { ctx.fillStyle = COLORS.amber; circle(ctx, -1, 3.4, 1.3); ctx.fill(); }
  ctx.restore();
}
