'use client';
import { Bug, Info, LocateFixed, X } from 'lucide-react';
import type { Language } from '../experiments/catalog';
import type { BeeState, WorldSnapshot } from '../simulation/types';
import { ThroughputChart } from './ThroughputChart';

const states: Record<BeeState, { tr: string; en: string }> = {
  Resting: { tr: 'Kovanda bekliyor', en: 'Resting in hive' }, Searching: { tr: 'Arıyor', en: 'Searching' },
  FlyingToResource: { tr: 'Kaynağa uçuyor', en: 'Flying to resource' }, Foraging: { tr: 'Besin topluyor', en: 'Foraging' },
  Returning: { tr: 'Kovana dönüyor', en: 'Returning' }, Dancing: { tr: 'Dans ediyor', en: 'Dancing' },
  ObservingDance: { tr: 'Dansı gözlüyor', en: 'Observing dance' },
};
interface Props { world: WorldSnapshot; language: Language; selected: number | null; onSelect: (id: number | null) => void; follow: boolean; onFollow: () => void; onNotes: () => void }
export function ColonyInspector({ world, language, selected, onSelect, follow, onFollow, onNotes }: Props) {
  const t = (en: string, tr: string) => language === 'en' ? en : tr;
  const m = world.metrics, n = (v: number, digits = 0) => v.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-GB', { maximumFractionDigits: digits });
  const sum = m.allocation.A + m.allocation.B;
  const bee = world.bees.find(b => b.id === selected), signal = bee ? world.signals.find(s => s.dancerId === bee.id) : null;
  return <aside className="colony-rail panel" aria-label={t('Colony inspector', 'Koloni inceleyicisi')}>
    {bee ? <>
      <div className="inspector-heading"><h2>{t('Bee', 'Arı')} #{bee.id}</h2><button aria-label={t('Close bee inspector', 'Arı inceleyicisini kapat')} onClick={() => onSelect(null)}><X size={16} /></button></div>
      <label className="bee-select-label" htmlFor="bee-select">{t('Select an individual', 'Bir birey seçin')}</label>
      <select id="bee-select" className="bee-select" value={bee.id} onChange={e => onSelect(Number(e.target.value))}>{world.bees.map(b => <option key={b.id} value={b.id}>#{b.id} · {states[b.state][language]}</option>)}</select>
      <div className="bee-state"><Bug size={26} strokeWidth={1.3} /><span>{states[bee.state][language]}</span></div>
      <dl className="metric-list"><div><dt>{t('Task', 'Görev')}</dt><dd>{bee.role === 'Scout' ? t('Scout', 'Keşifçi') : t('Forager', 'Toplayıcı')}</dd></div>
        <div><dt>{t('Energy proxy', 'Enerji göstergesi')}</dt><dd>{n(bee.energy)}%</dd></div>
        <div><dt>{t('Successful trips', 'Başarılı sefer')}</dt><dd>{bee.experience}</dd></div>
        <div><dt>{t('Last dancer seen', 'Son izlediği dansçı')}</dt><dd>{bee.observedDancer ? `#${bee.observedDancer}` : '—'}</dd></div>
      </dl>
      <section className="knowledge"><h3>{t('Private knowledge', 'Bireysel bilgi')}</h3>
        {!bee.memory.length && <p>{t('No known food. This bee cannot see the colony’s resource map.', 'Bilinen besin yok. Bu arı koloninin kaynak haritasını göremez.')}</p>}
        {bee.memory.map(memory => <div className="memory-entry" key={memory.patchId}><strong>{t('Source', 'Kaynak')} {memory.patchId}</strong><span>{memory.source === 'visit' ? t('Personal visit', 'Kendi ziyareti') : t('Dance report', 'Dans bildirimi')}</span><small>{t('Estimated quality', 'Tahmini kalite')} {memory.quality.toFixed(2)} · {t('expires in', 'kalan süre')} {Math.max(0, (memory.expiresAt - world.tick) / 10).toFixed(0)}s</small></div>)}
      </section>
      {signal && <section className="signal-inspector"><h3>{t('Encoded in this dance', 'Bu dansta kodlanan')}</h3>
        <dl className="metric-list"><div><dt>{t('Direction¹', 'Yön¹')}</dt><dd>{((signal.direction * 180 / Math.PI + 360) % 360).toFixed(0)}°</dd></div>
          <div><dt>{t('Distance', 'Mesafe')}</dt><dd>{signal.distance.toFixed(0)} u</dd></div>
          <div><dt>{t('Duration code²', 'Süre kodu²')}</dt><dd>{signal.durationCode.toFixed(2)} s</dd></div>
          <div><dt>{t('Utility', 'Fayda')}</dt><dd>{signal.utility.toFixed(3)}</dd></div>
          <div><dt>{t('Expires in', 'Kalan süre')}</dt><dd>{((signal.expiresAt - world.tick) / 10).toFixed(1)} s</dd></div></dl>
        <p className="control-note">{t('¹ Clockwise from east. ² Distance ÷ 250; educational code, not a biological calibration.', '¹ Doğudan saat yönünde. ² Mesafe ÷ 250; eğitsel kod, biyolojik kalibrasyon değildir.')}</p>
      </section>}
      <button className={`inspect-button ${follow ? 'selected' : ''}`} aria-pressed={follow} onClick={onFollow}><LocateFixed size={16} />{follow ? t('Following bee', 'Arı izleniyor') : t('Follow bee', 'Arıyı takip et')}</button>
      <p className="small-note">{t('Private estimates can be stale. Only a new visit reveals current conditions.', 'Bireysel tahminler eski olabilir. Güncel koşullar yeni bir ziyarette öğrenilir.')}</p>
    </> : <>
      <h2>{t('The colony', 'Koloni')}</h2><p className="population-count">{world.bees.length} {t('bees', 'arı')}</p>
      <div className="primary-metric" data-testid="throughput">{n(m.throughput, 1)}</div>
      <div className="metric-unit">{t('food units / model min', 'besin birimi / model dk')}</div>
      <dl className="metric-list">
        <div><dt>{t('Food collected', 'Toplanan besin')}</dt><dd data-testid="food-collected">{n(m.foodCollected, 1)}</dd></div>
        <div><dt>{t('First discovery', 'İlk keşif')}</dt><dd>{m.firstDiscoveryTick === null ? '—' : `${(m.firstDiscoveryTick / 10).toFixed(1)} s`}</dd></div>
        <div><dt>{t('Scouts in flight', 'Uçuştaki keşifçiler')}</dt><dd>{m.activeScouts}</dd></div>
        <div><dt>{t('Recruited foragers', 'Katılan toplayıcılar')}</dt><dd>{m.recruitedForagers}</dd></div>
      </dl>
      <section className="allocation"><h3>{t('Resource allocation', 'Kaynak dağılımı')}<button className="info-button" aria-label={t('Metric definitions', 'Ölçüm tanımları')} onClick={onNotes}><Info size={14} /></button></h3>
        {(['A', 'B'] as const).map(id => <div className={`allocation-row ${id.toLowerCase()}`} key={id}><span>{id}</span><div className="allocation-track"><span style={{ width: `${sum ? m.allocation[id] / sum * 100 : 0}%` }} /></div><span>{sum ? Math.round(m.allocation[id] / sum * 100) : 0}%</span></div>)}
        <p className="control-note">{sum ? t(`${sum} source-directed flights`, `${sum} kaynağa yönelik uçuş`) : t('No source-directed flights yet.', 'Henüz kaynağa yönelik uçuş yok.')}</p>
      </section>
      <section className="chart-section"><h3>{t('Food intake rate', 'Besin toplama hızı')}</h3><ThroughputChart history={world.history} language={language} /></section>
      <button className="inspect-button" onClick={() => onSelect(world.bees.find(b => b.state === 'Dancing')?.id ?? world.bees.find(b => b.role === 'Scout')!.id)}><Bug size={16} />{t('Inspect a bee', 'Arıyı incele')}</button>
      <p className="small-note">{t('No bee knows the whole landscape.', 'Hiçbir arı tüm peyzajı bilmez.')}</p>
    </>}
  </aside>;
}
